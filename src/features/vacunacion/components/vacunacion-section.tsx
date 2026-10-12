import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/theme';
import { useVacunacion } from '../hooks/use-vacunacion';
import { vacunacionService } from '../services/vacunacion.service';
import type { Esquema, Id, Vacunacion, EstadoVacunacion } from '../types';
import { esFechaReal, fechaSoloDia, hoyLocal } from '../types';
import { Boton, Campo, Estado, Panel, uiStyles } from './ui-vacunacion';

type Props = { idNino: Id; fechaNacimiento: string };
type Modo = 'aplicar' | 'editar' | null;

function nombreEsquema(esquema: Esquema | null | undefined): string {
  return `${esquema?.vacuna?.nombre ?? 'Vacuna sin nombre'} · Dosis ${esquema?.numero_dosis ?? '—'}`;
}

function Contador({ valor, label }: { valor: number; label: string }) {
  return <View style={s.counter}>
    <Text style={s.counterNumber}>{valor}</Text>
    <Text style={uiStyles.muted}>{label}</Text>
  </View>;
}

export function VacunacionSection({ idNino, fechaNacimiento }: Props) {
  const { registros, esquemas, loading, error, refresh } = useVacunacion(idNino);
  const [mostrarEsquemas, setMostrarEsquemas] = useState(false);
  const [search, setSearch] = useState('');
  const [modalRegistro, setModalRegistro] = useState<Vacunacion | null>(null);
  const [modo, setModo] = useState<Modo>(null);
  const [fecha, setFecha] = useState(hoyLocal());
  const [lote, setLote] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estadoEdicion, setEstadoEdicion] = useState<'PENDIENTE' | 'ATRASADA'>('PENDIENTE');
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const ids = useMemo(() => new Set(registros.map((r) => String(r.id_esquema))), [registros]);
  const sinRegistro = useMemo(() => esquemas.filter((e) =>
    e.activo !== false && e.vacuna?.activo !== false && !ids.has(String(e.id_esquema))),
    [esquemas, ids]);
  const opciones = useMemo(() => sinRegistro.filter((e) =>
    nombreEsquema(e).toLowerCase().includes(search.trim().toLowerCase())), [sinRegistro, search]);

  const contador = (estado: EstadoVacunacion) => registros.filter((r) => r.estado === estado).length;
  const aplicadas = contador('APLICADA');
  const pendientes = contador('PENDIENTE');
  const atrasadas = contador('ATRASADA');

  const cerrar = () => {
    if (guardando) return;
    setMostrarEsquemas(false);
    setModalRegistro(null);
    setModo(null);
    setErrorAccion(null);
  };

  const abrirAplicacion = (registro: Vacunacion) => {
    setModalRegistro(registro);
    setModo('aplicar');
    setFecha(hoyLocal());
    setLote(registro.lote_vacuna ?? '');
    setObservaciones(registro.observaciones ?? '');
    setErrorAccion(null);
  };

  const abrirEdicion = (registro: Vacunacion) => {
    setModalRegistro(registro);
    setModo('editar');
    setFecha(fechaSoloDia(registro.fecha_programada) === '—' ? '' : fechaSoloDia(registro.fecha_programada));
    setEstadoEdicion(registro.estado === 'ATRASADA' ? 'ATRASADA' : 'PENDIENTE');
    setLote(registro.lote_vacuna ?? '');
    setObservaciones(registro.observaciones ?? '');
    setErrorAccion(null);
  };

  const registrarPendiente = async (esquema: Esquema) => {
    const id = Number(idNino);
    const esquemaId = Number(esquema.id_esquema);
    if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(esquemaId) || esquemaId <= 0) {
      setErrorAccion('Identificador del niño o esquema inválido.');
      return;
    }
    setGuardando(true);
    setErrorAccion(null);
    try {
      // El backend calcula automáticamente fecha_programada según el esquema.
      const res = await vacunacionService.registrarPendiente({ id_nino: id, id_esquema: esquemaId, estado: 'PENDIENTE' });
      if (!res.success) throw new Error(res.message);
      setMostrarEsquemas(false);
      refresh();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : 'No se pudo programar la dosis.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarRegistro = async () => {
    if (!modalRegistro || !modo || guardando) return;
    if (!esFechaReal(fecha)) { setErrorAccion('Ingrese una fecha válida YYYY-MM-DD.'); return; }
    if (modo === 'aplicar' && (fecha > hoyLocal() || fecha < fechaSoloDia(fechaNacimiento))) {
      setErrorAccion('La aplicación debe estar entre el nacimiento y la fecha actual.'); return;
    }
    if (lote.trim().length > 100 || observaciones.trim().length > 1000) {
      setErrorAccion('El lote admite 100 caracteres y las observaciones 1000.'); return;
    }
    setGuardando(true);
    setErrorAccion(null);
    try {
      const res = modo === 'aplicar'
        ? await vacunacionService.aplicar(modalRegistro.id_vacunacion_nino, {
            fecha_aplicacion: fecha, lote: lote.trim() || null, observaciones: observaciones.trim() || null,
          })
        : await vacunacionService.actualizar(modalRegistro.id_vacunacion_nino, {
            fecha_programada: fecha, estado: estadoEdicion,
            lote: lote.trim() || null, observaciones: observaciones.trim() || null,
          });
      if (!res.success) throw new Error(res.message);
      setModalRegistro(null);
      setModo(null);
      refresh();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : 'No se pudo guardar el registro.');
    } finally { setGuardando(false); }
  };

  return <Panel title="Carnet de vacunación y próximas dosis" right={<Boton label="Actualizar" outline onPress={refresh} disabled={loading} />}>
    {loading ? <View style={s.loading}><ActivityIndicator color={colors.primary} /><Text style={uiStyles.muted}>Cargando vacunación...</Text></View>
    : error ? <><Text style={uiStyles.error}>{error}</Text><Boton label="Reintentar" outline onPress={refresh}/></>
    : <>
      <View style={s.rowStats}>
        <Contador valor={aplicadas} label="Aplicadas registradas" />
        <Contador valor={pendientes} label="Pendientes registradas" />
        <Contador valor={atrasadas} label="Atrasadas registradas" />
      </View>
      <Text style={uiStyles.muted}>
        {sinRegistro.length} dosis activas del esquema sin registro individual. No se consideran aplicadas, pendientes ni atrasadas automáticamente.
      </Text>
      <Boton label="Agregar dosis pendiente del esquema" onPress={() => { setMostrarEsquemas(true); setErrorAccion(null); }} />
      {registros.length === 0 ? <Text style={uiStyles.muted}>Todavía no hay vacunaciones registradas para este niño.</Text> :
        registros.map((r) => <View key={String(r.id_vacunacion_nino)} style={s.record}>
          <View style={s.recordBody}>
            <Text style={s.recordTitle}>{nombreEsquema(r.esquema)}</Text>
            <Estado estado={r.estado} />
            <Text style={uiStyles.muted}>Programada: {fechaSoloDia(r.fecha_programada)} · Aplicada: {fechaSoloDia(r.fecha_aplicacion)}</Text>
            {r.lote_vacuna ? <Text style={uiStyles.muted}>Lote: {r.lote_vacuna}</Text> : null}
            {r.proxima_dosis ? <Text style={uiStyles.muted}>Próxima dosis calculada: {fechaSoloDia(r.proxima_dosis)}</Text> : null}
            {r.observaciones ? <Text style={uiStyles.muted}>Observaciones: {r.observaciones}</Text> : null}
          </View>
          {r.estado !== 'APLICADA' ? <View style={s.actions}>
            <Boton label="Aplicar" onPress={() => abrirAplicacion(r)} />
            <Boton label="Editar" outline onPress={() => abrirEdicion(r)} />
          </View> : null}
        </View>)
      }
    </>}

    <Modal visible={mostrarEsquemas} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={s.modalScrim}><View style={s.modalBody}>
        <Text style={s.recordTitle}>Seleccionar dosis del esquema</Text>
        <Campo label="Buscar vacuna o dosis" value={search} onChange={setSearch} placeholder="Ej. Pentavalente" />
        <Text style={uiStyles.muted}>Se creará un registro PENDIENTE. La fecha programada la calcula Express.</Text>
        <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
          {opciones.map((es) => <Pressable key={String(es.id_esquema)} style={s.option}
            disabled={guardando} onPress={() => void registrarPendiente(es)}>
            <Text style={uiStyles.body}>{nombreEsquema(es)}</Text>
            <Text style={uiStyles.muted}>Edad recomendada: {es.edad_recomendada_meses} meses</Text>
          </Pressable>)}
          {opciones.length === 0 ? <Text style={uiStyles.muted}>No hay dosis disponibles.</Text> : null}
        </ScrollView>
        {errorAccion ? <Text style={uiStyles.error}>{errorAccion}</Text> : null}
        <Boton label="Cerrar" outline onPress={cerrar} disabled={guardando} />
      </View></View>
    </Modal>

    <Modal visible={modalRegistro !== null} animationType="fade" transparent onRequestClose={cerrar}>
      <View style={s.modalScrim}><ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
        <Text style={s.recordTitle}>{modo === 'aplicar' ? 'Confirmar aplicación de vacuna' : 'Editar dosis programada'}</Text>
        <Text style={uiStyles.muted}>{nombreEsquema(modalRegistro?.esquema)}</Text>
        <Campo label={modo === 'aplicar' ? 'Fecha de aplicación *' : 'Fecha programada *'}
          value={fecha} onChange={setFecha} placeholder="YYYY-MM-DD" />
        {modo === 'editar' ? <View style={s.actions}>
          <Boton label="Pendiente" outline={estadoEdicion !== 'PENDIENTE'} onPress={() => setEstadoEdicion('PENDIENTE')} />
          <Boton label="Atrasada" outline={estadoEdicion !== 'ATRASADA'} onPress={() => setEstadoEdicion('ATRASADA')} />
        </View> : null}
        <Campo label="Lote (opcional)" value={lote} onChange={setLote} />
        <Campo label="Observaciones (opcional)" value={observaciones} onChange={setObservaciones} multiline />
        {modo === 'aplicar' ? <Text style={uiStyles.muted}>Esta acción registra una administración real. Verifique la dosis y fecha antes de confirmar.</Text> : null}
        {errorAccion ? <Text style={uiStyles.error}>{errorAccion}</Text> : null}
        <View style={s.actions}>
          <Boton label="Cancelar" outline disabled={guardando} onPress={cerrar}/>
          <Boton label={modo === 'aplicar' ? 'Confirmar aplicación' : 'Guardar cambios'}
            loading={guardando} onPress={() => void guardarRegistro()} />
        </View>
      </ScrollView></View>
    </Modal>
  </Panel>;
}

const s = StyleSheet.create({
  loading: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  rowStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  counter: { padding: 12, flex: 1, minWidth: 110, borderRadius: 8, backgroundColor: colors.canvas, gap: 3 },
  counterNumber: { fontSize: 22, color: colors.text, fontWeight: '800' },
  record: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 12,
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  recordBody: { flex: 1, minWidth: 210, gap: 6 },
  recordTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalScrim: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15,
    backgroundColor: 'rgba(16,24,40,0.55)' },
  modalBody: { backgroundColor: '#fff', borderRadius: 12, padding: 18, gap: 12,
    maxWidth: 560, width: '100%', maxHeight: '90%' },
  option: { paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
});
