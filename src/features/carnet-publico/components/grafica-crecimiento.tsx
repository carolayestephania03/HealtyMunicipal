import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import type { ControlCrecimientoPublico } from '../types';

type Unidad = 'peso_kg' | 'talla_cm';
export function GraficaCrecimiento({ registros, tipo }: { registros: ControlCrecimientoPublico[]; tipo: Unidad }) {
  const datos = registros
    .filter((r) => r[tipo] != null && Number.isFinite(Number(r[tipo])))
    .map((r, i) => ({ index: i, edad: r.edad_meses, y: Number(r[tipo]) }));
  const titulo = tipo === 'peso_kg' ? 'Peso por control (kg)' : 'Talla por control (cm)';
  if (datos.length === 0) return <View style={s.panel}><Text style={s.titulo}>{titulo}</Text><Text style={s.muted}>Sin mediciones registradas.</Text></View>;
  const width = 320;
  const height = 174;
  const min = Math.min(...datos.map((d) => d.y));
  const max = Math.max(...datos.map((d) => d.y));
  const margen = Math.max(0.5, (max - min) * 0.18);
  const piso = Math.max(0, min - margen);
  const techo = max + margen;
  const yPos = (v: number) => 127 - ((v - piso) / (techo - piso || 1)) * 103;
  const xPos = (i: number) => 37 + (i / Math.max(1, datos.length - 1)) * 260;
  const puntos = datos.map((d, i) => `${xPos(i)},${yPos(d.y)}`).join(' ');
  const color = tipo === 'peso_kg' ? '#0C63E7' : '#0E9887';
  return <View style={s.panel}>
    <Text style={s.titulo}>{titulo}</Text>
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 1, 2, 3].map((i) => {
        const y = 24 + i * 34;
        const numero = techo - ((techo - piso) / 3) * i;
        return <React.Fragment key={i}>
          <Line x1={38} y1={y} x2={298} y2={y} stroke="#E7ECF4" strokeWidth={1} />
          <SvgText x={31} y={y + 4} fill="#697891" textAnchor="end" fontSize={9}>{numero.toFixed(1)}</SvgText>
        </React.Fragment>;
      })}
      {datos.length > 1 ? <Polyline points={puntos} fill="none" stroke={color} strokeWidth={2.5} /> : null}
      {datos.map((d, i) => <Circle key={i} cx={xPos(i)} cy={yPos(d.y)} r={3.5} fill={color} />)}
      <SvgText x={38} y={157} fill="#697891" fontSize={10}>
        {datos[0].edad == null ? 'Primer control' : `${datos[0].edad} meses`}
      </SvgText>
      <SvgText x={297} y={157} textAnchor="end" fill="#697891" fontSize={10}>
        {datos[datos.length - 1].edad == null ? 'Último control' : `${datos[datos.length - 1].edad} meses`}
      </SvgText>
    </Svg>
    <Text style={s.muted}>Evolución de mediciones registradas; no representa curvas de referencia OMS.</Text>
  </View>;
}
const s = StyleSheet.create({
  panel: { flexGrow: 1, flexBasis: 310, minWidth: 250, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DFE7F2', borderRadius: 12, padding: 15, gap: 6 },
  titulo: { color: '#10274B', fontWeight: '700', fontSize: 14 },
  muted: { color: '#687994', fontSize: 11, lineHeight: 17 },
});
