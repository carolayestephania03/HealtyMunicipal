import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import type { Vacuna } from '../../vacunacion/types';
import { vacunasService } from '../services/vacunas.service';
import { Boton, Campo, Panel, uiStyles } from '../../vacunacion/components/ui-vacunacion';

type Vista = 'lista' | 'ver' | 'crear' | 'editar';
type Filtro = 'TODAS' | 'ACTIVAS' | 'INACTIVAS';
const TAMANIO_PAGINA = 7;

const activa = (vacuna: Vacuna): boolean => vacuna.activo !== false;
const textoError = (err: unknown, mensaje: string): string =>
  err instanceof Error ? err.message : mensaje;

export function VacunasCrudSection() {
  const [registros, setRegistros] = useState<Vacuna[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>('TODAS');
  const [consulta, setConsulta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [vista, setVista] = useState<Vista>('lista');
  const [seleccionada, setSeleccionada] = useState<Vacuna | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [confirmarEstado, setConfirmarEstado] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await vacunasService.listar(controller.signal);
        if (controller.signal.aborted) return;
        if (!respuesta.success || !Array.isArray(respuesta.data)) {
          throw new Error('El servidor no devolvió un catálogo válido de vacunas.');
        }
        setRegistros(respuesta.data);
      } catch (e) {
        if (!controller.signal.aborted) setError(textoError(e, 'No se pudieron cargar las vacunas.'));
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };
    void cargar();
    return () => controller.abort();
  }, [revision]);

  const visibles = useMemo(() => {
    const buscar = consulta.trim().toLocaleLowerCase();
    return registros.filter((v) => {
      const mostrarEstado = filtro === 'TODAS' ||
        (filtro === 'ACTIVAS' && activa(v)) ||
        (filtro === 'INACTIVAS' && !activa(v));
      const contenido = `${v.nombre ?? ''} ${v.descripcion ?? ''} ${v.id_vacuna}`.toLocaleLowerCase();
      return mostrarEstado && contenido.includes(buscar);
    });
  }, [registros, filtro, consulta]);

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / TAMANIO_PAGINA));
  const paginaReal = Math.min(pagina, totalPaginas);
  const resultadoPagina = visibles.slice((paginaReal - 1) * TAMANIO_PAGINA, paginaReal * TAMANIO_PAGINA);
  const totalActivas = registros.filter(activa).length;
  const totalInactivas = registros.length - totalActivas;

  const volver = () => {
    if (guardando) return;
    setVista('lista');
    setSeleccionada(null);
    setConfirmarEstado(false);
    setErrorFormulario(null);
  };

  const abrirCrear = () => {
    setNombre('');
    setDescripcion('');
    setSeleccionada(null);
    setErrorFormulario(null);
    setAviso(null);
    setConfirmarEstado(false);
    setVista('crear');
  };

  const abrirDetalle = (v: Vacuna) => {
    setSeleccionada(v);
    setConfirmarEstado(false);
    setErrorFormulario(null);
    setVista('ver');
  };

  const abrirEditar = (v: Vacuna) => {
    setSeleccionada(v);
    setNombre(v.nombre ?? '');
    setDescripcion(v.descripcion ?? '');
    setConfirmarEstado(false);
    setErrorFormulario(null);
    setVista('editar');
  };

  const guardar = async () => {
    if (guardando) return;
    const limpio = nombre.trim();
    const detalle = descripcion.trim();
    if (limpio.length < 2 || limpio.length > 150) {
      setErrorFormulario('El nombre debe tener entre 2 y 150 caracteres.');
      return;
    }
    if (detalle.length > 500) {
      setErrorFormulario('La descripción no debe superar 500 caracteres.');
      return;
    }
    const repetida = registros.some((v) =>
      String(v.id_vacuna) !== String(seleccionada?.id_vacuna ?? '') &&
      v.nombre.trim().toLocaleLowerCase() === limpio.toLocaleLowerCase()
    );
    if (repetida) {
      setErrorFormulario('Ya existe otra vacuna con ese nombre.');
      return;
    }
    setGuardando(true);
    setErrorFormulario(null);
    try {
      const payload = { nombre: limpio, descripcion: detalle || null };
      const resultado = vista === 'editar' && seleccionada
        ? await vacunasService.editar(seleccionada.id_vacuna, payload)
        : await vacunasService.crear(payload);
      if (!resultado.success) throw new Error(resultado.message || 'La API no confirmó la operación.');
      setVista('lista');
      setSeleccionada(null);
      setAviso(vista === 'crear' ? 'Vacuna registrada correctamente.' : 'Vacuna actualizada correctamente.');
      setPagina(1);
      setRevision((n) => n + 1);
    } catch (e) {
      setErrorFormulario(textoError(e, 'No se pudo guardar la vacuna.'));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async () => {
    if (!seleccionada || guardando) return;
    const siguiente = !activa(seleccionada);
    setGuardando(true);
    setErrorFormulario(null);
    try {
      const respuesta = await vacunasService.cambiarEstado(seleccionada.id_vacuna, siguiente);
      if (!respuesta.success) throw new Error(respuesta.message || 'La API rechazó el cambio de estado.');
      setVista('lista');
      setSeleccionada(null);
      setConfirmarEstado(false);
      setAviso(siguiente
        ? 'Vacuna reactivada: vuelve a estar disponible para nuevas selecciones.'
        : 'Vacuna desactivada: deja de estar disponible para nuevas selecciones. Los historiales se conservan.');
      setRevision((n) => n + 1);
    } catch (e) {
      setErrorFormulario(textoError(e, 'No se pudo modificar el estado de la vacuna.'));
    } finally {
      setGuardando(false);
    }
  };

  return <View style={s.contenido}>
    <View style={s.resumen}>
      <Resumen titulo="Total de vacunas" valor={registros.length} icono="medical-outline" />
      <Resumen titulo="Vacunas activas" valor={totalActivas} icono="checkmark-circle-outline" />
      <Resumen titulo="Vacunas inactivas" valor={totalInactivas} icono="ban-outline" />
    </View>

    {vista === 'lista' ? <Panel title="Catálogo de vacunas" right={
      <View style={s.acciones}>
        <Boton label="Actualizar" outline disabled={cargando} onPress={() => setRevision((n) => n + 1)} />
        <Boton label="Nueva vacuna" onPress={abrirCrear} />
      </View>
    }>
      <Text style={uiStyles.muted}>Administra el catálogo de tipos de vacuna. Desactivar no borra las aplicaciones realizadas.</Text>
      {aviso ? <Text style={s.exito}>{aviso}</Text> : null}
      <TextInput
        style={s.buscador}
        value={consulta}
        onChangeText={(v) => { setConsulta(v); setPagina(1); }}
        placeholder="Buscar por nombre, descripción o identificador..."
        placeholderTextColor={colors.muted}
        accessibilityLabel="Buscar vacunas"
      />
      <View style={s.acciones}>
        {(['TODAS', 'ACTIVAS', 'INACTIVAS'] as const).map((estado) =>
          <Boton key={estado} label={estado === 'TODAS' ? 'Todas' : estado === 'ACTIVAS' ? 'Activas' : 'Inactivas'}
            outline={filtro !== estado} onPress={() => { setFiltro(estado); setPagina(1); }} />)}
      </View>
      {cargando ? <View style={s.centrado}><ActivityIndicator color={colors.primary}/><Text style={uiStyles.muted}>Consultando catálogo...</Text></View> :
       error ? <><Text style={uiStyles.error}>{error}</Text><Boton label="Reintentar" outline onPress={() => setRevision((n) => n + 1)}/></> :
       resultadoPagina.length === 0 ? <Text style={uiStyles.muted}>No hay vacunas con los filtros seleccionados.</Text> :
       resultadoPagina.map((vacuna) => <View style={s.fila} key={String(vacuna.id_vacuna)}>
         <View style={s.datos}>
           <Text style={s.nombre}>{vacuna.nombre}</Text>
           <Text style={uiStyles.muted}>ID: {vacuna.id_vacuna}</Text>
           {vacuna.descripcion ? <Text style={uiStyles.body}>{vacuna.descripcion}</Text> : null}
           <View style={[s.insignia, { backgroundColor: activa(vacuna) ? colors.successLight : colors.dangerLight }]}>
             <Text style={[s.insigniaTexto, { color: activa(vacuna) ? colors.success : colors.danger }]}>
               {activa(vacuna) ? 'ACTIVA' : 'INACTIVA'}
             </Text>
           </View>
         </View>
         <View style={s.acciones}>
           <Boton label="Ver" outline onPress={() => abrirDetalle(vacuna)} />
           <Boton label="Editar" outline onPress={() => abrirEditar(vacuna)} />
           <Boton label={activa(vacuna) ? 'Desactivar' : 'Reactivar'}
             danger={activa(vacuna)} outline={!activa(vacuna)} onPress={() => { abrirDetalle(vacuna); setConfirmarEstado(true); }}/>
         </View>
       </View>)}
      {!cargando && !error ? <View style={s.paginacion}>
        <Text style={uiStyles.muted}>{visibles.length} registro(s) · Página {paginaReal} de {totalPaginas}</Text>
        <View style={s.acciones}>
          <Boton label="Anterior" outline disabled={paginaReal <= 1} onPress={() => setPagina((p) => Math.max(1, p - 1))}/>
          <Boton label="Siguiente" outline disabled={paginaReal >= totalPaginas} onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}/>
        </View>
      </View> : null}
    </Panel> : null}

    {(vista === 'crear' || vista === 'editar') ? <Panel title={vista === 'crear' ? 'Registrar nueva vacuna' : 'Editar vacuna'}>
      <Text style={uiStyles.muted}>Los cambios afectan al catálogo. El historial de vacunaciones registradas no se altera.</Text>
      <Campo label="Nombre de la vacuna *" value={nombre} onChange={setNombre} placeholder="Ej. Pentavalente" />
      <Campo label="Descripción (opcional)" value={descripcion} onChange={setDescripcion} multiline
        placeholder="Descripción o información del tipo de vacuna" />
      {seleccionada ? <Text style={uiStyles.muted}>ID: {seleccionada.id_vacuna} · Estado: {activa(seleccionada) ? 'Activa' : 'Inactiva'}</Text> : null}
      {errorFormulario ? <Text style={uiStyles.error}>{errorFormulario}</Text> : null}
      <View style={s.acciones}>
        <Boton label="Cancelar" outline disabled={guardando} onPress={volver}/>
        <Boton label="Guardar vacuna" loading={guardando} onPress={() => void guardar()}/>
      </View>
    </Panel> : null}

    {vista === 'ver' && seleccionada ? <Panel title="Detalle de la vacuna">
      <View style={s.detalle}>
        <Ionicons name="medkit-outline" size={25} color={colors.primary}/>
        <View style={s.datos}>
          <Text style={s.nombre}>{seleccionada.nombre}</Text>
          <Text style={uiStyles.muted}>Identificador: {seleccionada.id_vacuna}</Text>
          <Text style={uiStyles.body}>Descripción: {seleccionada.descripcion || 'Sin descripción'}</Text>
          <Text style={[s.nombre, { color: activa(seleccionada) ? colors.success : colors.danger }]}>
            Estado: {activa(seleccionada) ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>
      {errorFormulario ? <Text style={uiStyles.error}>{errorFormulario}</Text> : null}
      {confirmarEstado ? <View style={s.confirmacion}>
        <Text style={s.nombre}>{activa(seleccionada) ? '¿Desactivar esta vacuna?' : '¿Reactivar esta vacuna?'}</Text>
        <Text style={uiStyles.body}>{activa(seleccionada)
          ? 'Dejará de aparecer en nuevas selecciones. Los esquemas, dosis y aplicaciones históricos no se eliminarán.'
          : 'Volverá a estar disponible para nuevas selecciones, siempre que el esquema correspondiente esté activo.'}</Text>
        <View style={s.acciones}>
          <Boton label="Cancelar" outline disabled={guardando} onPress={() => setConfirmarEstado(false)}/>
          <Boton label={activa(seleccionada) ? 'Confirmar desactivación' : 'Confirmar reactivación'}
            danger={activa(seleccionada)} loading={guardando} onPress={() => void cambiarEstado()}/>
        </View>
      </View> : null}
      <View style={s.acciones}>
        <Boton label="Volver al catálogo" outline disabled={guardando} onPress={volver}/>
        <Boton label="Editar información" outline disabled={guardando} onPress={() => abrirEditar(seleccionada)}/>
        {!confirmarEstado ? <Boton label={activa(seleccionada) ? 'Desactivar vacuna' : 'Reactivar vacuna'}
          danger={activa(seleccionada)} disabled={guardando} onPress={() => setConfirmarEstado(true)}/> : null}
      </View>
    </Panel> : null}
  </View>;
}

function Resumen({ titulo, valor, icono }: {titulo: string; valor: number; icono: React.ComponentProps<typeof Ionicons>['name']}) {
  return <View style={s.resumenTarjeta}>
    <Ionicons name={icono} size={20} color={colors.primary}/>
    <Text style={s.valorResumen}>{valor}</Text>
    <Text style={uiStyles.muted}>{titulo}</Text>
  </View>;
}

const s = StyleSheet.create({
  contenido: { gap: 14 },
  resumen: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resumenTarjeta: { flexGrow: 1, flexBasis: 170, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface, padding: 16, borderRadius: 12, gap: 7 },
  valorResumen: { color: colors.text, fontSize: 25, fontWeight: '800' },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  buscador: { minHeight: 44, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, backgroundColor: colors.surface, paddingHorizontal: 12, color: colors.text, fontSize: 14 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14,
    borderTopWidth: 1, borderColor: colors.border, paddingVertical: 13 },
  datos: { flex: 1, minWidth: 215, gap: 6 },
  nombre: { fontSize: 15, fontWeight: '700', color: colors.text },
  insignia: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, alignSelf: 'flex-start' },
  insigniaTexto: { fontSize: 11, fontWeight: '700' },
  paginacion: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  centrado: { paddingVertical: 18, alignItems: 'center', gap: 7 },
  exito: { color: colors.success, fontSize: 13, fontWeight: '700' },
  detalle: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  confirmacion: { borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    backgroundColor: colors.canvas, padding: 14, gap: 10 },
});
