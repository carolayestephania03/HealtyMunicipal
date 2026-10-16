import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/theme';
import type { Vacunacion, EstadoVacunacion } from '../types';
import { fechaSoloDia } from '../types';
import { vacunacionService } from '../services/vacunacion.service';
import { VacunasCrudSection } from '../../vacunas/components/vacunas-crud-section';
import { Panel, Boton, Campo, Estado, uiStyles } from './ui-vacunacion';

export function VacunacionScreen() {
  const [registros, setRegistros] = useState<Vacunacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoVacunacion | 'TODOS'>('TODOS');
  const [revision, setRevision] = useState(0);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);

  useEffect(() => {
    if (mostrarCatalogo) return;
    const controller = new AbortController();
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const resultado = await vacunacionService.listar(controller.signal);
        if (controller.signal.aborted) return;
        if (!resultado.success || !Array.isArray(resultado.data)) throw new Error('Respuesta de vacunaciones inválida.');
        setRegistros(resultado.data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Error consultando vacunaciones.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void cargar();
    return () => controller.abort();
  }, [revision, mostrarCatalogo]);

  const filtrados = useMemo(() => registros.filter((r) => {
    const contenido = `${r.nino?.nombres ?? ''} ${r.nino?.apellidos ?? ''} ${r.nino?.codigo_expediente ?? ''} ${r.esquema?.vacuna?.nombre ?? ''}`.toLowerCase();
    return (estado === 'TODOS' || r.estado === estado) && contenido.includes(texto.trim().toLowerCase());
  }), [registros, texto, estado]);

  return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <View style={s.encabezado}>
      <View style={s.encabezadoTexto}>
        <Text style={s.title}>Vacunación</Text>
        <Text style={uiStyles.muted}>{mostrarCatalogo ? 'Administración del catálogo de vacunas.' : 'Registros y estados guardados en PostgreSQL.'}</Text>
      </View>
      <Boton label={mostrarCatalogo ? 'Volver a vacunaciones' : 'Gestionar vacunas'}
        outline={mostrarCatalogo} onPress={() => setMostrarCatalogo((previo) => !previo)} />
    </View>

    {mostrarCatalogo ? <VacunasCrudSection /> :
      <Panel title="Consultar vacunaciones" right={<Boton label="Actualizar" outline onPress={() => setRevision((v) => v + 1)} /> }>
        <Campo label="Buscar niño, expediente o vacuna" value={texto} onChange={setTexto} placeholder="Escriba para filtrar" />
        <View style={s.filters}>{(['TODOS', 'PENDIENTE', 'APLICADA', 'ATRASADA'] as const).map((opcion) =>
          <Boton key={opcion} label={opcion} outline={estado !== opcion} onPress={() => setEstado(opcion)} />)}</View>
        {loading ? <ActivityIndicator color={colors.primary} /> : error ?
          <><Text style={uiStyles.error}>{error}</Text><Boton label="Reintentar" outline onPress={() => setRevision((v) => v + 1)}/></> :
          filtrados.length === 0 ? <Text style={uiStyles.muted}>No se encontraron registros.</Text> :
          filtrados.map((r) => <View style={s.record} key={String(r.id_vacunacion_nino)}>
            <View style={{ flex: 1, minWidth: 170, gap: 5 }}>
              <Text style={s.name}>{r.nino?.nombres ?? 'Niño'} {r.nino?.apellidos ?? ''}</Text>
              <Text style={uiStyles.muted}>Expediente: {r.nino?.codigo_expediente ?? '—'}</Text>
              <Text style={uiStyles.body}>{r.esquema?.vacuna?.nombre ?? 'Vacuna'} · Dosis {r.esquema?.numero_dosis ?? '—'}</Text>
              <Text style={uiStyles.muted}>Programada: {fechaSoloDia(r.fecha_programada)} · Aplicada: {fechaSoloDia(r.fecha_aplicacion)}</Text>
              <Estado estado={r.estado}/>
            </View>
            <Boton label="Abrir expediente" outline onPress={() => router.push({ pathname: '/ninos/[id]', params: { id: String(r.id_nino) } })} />
          </View>)}
      </Panel>}
  </ScrollView>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 18, gap: 14 },
  encabezado: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  encabezadoTexto: { flex: 1, minWidth: 220, gap: 4 },
  title: { fontSize: 23, fontWeight: '800', color: colors.text },
  filters: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  record: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 12,
    borderTopWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 10 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
});
