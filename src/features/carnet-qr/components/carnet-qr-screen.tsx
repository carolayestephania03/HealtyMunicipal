import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../../services/api/api-client';
import { colors } from '../../../constants/theme';
import { Panel, Boton, Campo, uiStyles } from '../../vacunacion/components/ui-vacunacion';
import { CarnetQrSection } from './carnet-qr-section';
import type { ApiResponse, Id } from '../../vacunacion/types';

type NinoResumen = { id_nino: Id; nombres: string; apellidos: string; codigo_expediente: string };

export function CarnetQrScreen() {
  const [ninos, setNinos] = useState<NinoResumen[]>([]);
  const [seleccionado, setSeleccionado] = useState<NinoResumen | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<NinoResumen[]>>('/api/ninos');
        if (!alive) return;
        if (!res.success || !Array.isArray(res.data)) throw new Error('La API no devolvió los niños.');
        setNinos(res.data);
      } catch (e) { if (alive) setError(e instanceof Error ? e.message : 'No se pudieron cargar los niños.'); }
      finally { if (alive) setLoading(false); }
    };
    void cargar();
    return () => { alive = false; };
  }, []);
  const filtrados = useMemo(() => ninos.filter((n) =>
    `${n.nombres} ${n.apellidos} ${n.codigo_expediente}`.toLowerCase().includes(busqueda.trim().toLowerCase())),
    [ninos, busqueda]);
  return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Carnet Digital QR</Text>
    <Text style={uiStyles.muted}>Selecciona un niño para consultar o emitir su carnet.</Text>
    <Panel title="Buscar niño">
      <Campo label="Nombres, apellidos o expediente" value={busqueda} onChange={setBusqueda} />
      {loading ? <ActivityIndicator color={colors.primary} /> : error ? <Text style={uiStyles.error}>{error}</Text> :
        <View style={{ maxHeight: 340, gap: 8 }}>
          {filtrados.slice(0, 40).map((n) => <View style={s.entry} key={String(n.id_nino)}>
            <Text style={uiStyles.body}>{n.nombres} {n.apellidos} · {n.codigo_expediente}</Text>
            <Boton label="Seleccionar" outline onPress={() => setSeleccionado(n)} />
          </View>)}
          {filtrados.length > 40 ? <Text style={uiStyles.muted}>Refina la búsqueda para mostrar más resultados.</Text> : null}
        </View>}
    </Panel>
    {seleccionado && <>
      <Text style={s.name}>{seleccionado.nombres} {seleccionado.apellidos}</Text>
      <CarnetQrSection key={String(seleccionado.id_nino)} idNino={seleccionado.id_nino} />
    </>}
  </ScrollView>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 18, gap: 12 },
  title: { fontSize: 23, fontWeight: '800', color: colors.text },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  entry: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
    gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
});
