import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tono = 'info' | 'success' | 'warning' | 'danger';
const tintas = {
  info: { t: colors.info, b: colors.infoLight },
  success: { t: colors.success, b: colors.successLight },
  warning: { t: colors.warning, b: colors.warningLight },
  danger: { t: colors.danger, b: colors.dangerLight },
};

export function DashboardKpi({ etiqueta, valor, detalle, icono, tono = 'info', width }: {
  etiqueta: string; valor: string | number; detalle: string;
  icono: IconName; tono?: Tono; width: `${number}%`;
}) {
  const paleta = tintas[tono];
  return (
    <View style={[styles.kpi, { width }]}>
      <View style={[styles.icono, { backgroundColor: paleta.b }]}>
        <Ionicons name={icono} color={paleta.t} size={22}/>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text style={styles.kpiValor}>{valor}</Text>
        <Text style={styles.kpiEtiqueta}>{etiqueta}</Text>
        <Text style={styles.kpiDetalle}>{detalle}</Text>
      </View>
    </View>
  );
}

export function Acceso({ titulo, subtitulo, icono, onPress }: {
  titulo: string; subtitulo: string; icono: IconName; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={titulo} onPress={onPress} style={({ pressed }) => [styles.acceso, pressed && { opacity: 0.75 }]}>
      <View style={styles.accesoIcono}><Ionicons name={icono} size={21} color={colors.primary}/></View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text style={styles.accesoTitulo}>{titulo}</Text>
        <Text style={styles.accesoDetalle}>{subtitulo}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={colors.primary}/>
    </Pressable>
  );
}

export function Vacio({ texto }: { texto: string }) {
  return <View style={styles.vacio}><Ionicons name="information-circle-outline" color={colors.muted} size={23}/><Text style={styles.vacioTexto}>{texto}</Text></View>;
}

export function Separador({ titulo, detalle, derecha }: { titulo: string; detalle?: string; derecha?: React.ReactNode }) {
  return (
    <View style={styles.cabecera}>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      </View>
      {derecha}
    </View>
  );
}

export function Barra({ etiqueta, valor, maximo, detalle, color = colors.primary }: {
  etiqueta: string; valor: number; maximo: number; detalle?: string; color?: string;
}) {
  const pct = maximo > 0 ? Math.min(100, valor / maximo * 100) : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.fila}>
        <Text style={[styles.filaLabel, { flex: 1 }]} numberOfLines={1}>{etiqueta}</Text>
        <Text style={styles.filaCantidad}>{detalle ?? String(valor)}</Text>
      </View>
      <View style={styles.track}><View style={{ width: `${pct}%`, backgroundColor: color, height: '100%', borderRadius: 99 }}/></View>
    </View>
  );
}

type PuntoMes = { key: string; label: string; valor: number };
export function GraficaMensual({ datos, color = colors.primary }: { datos: PuntoMes[]; color?: string }) {
  const [width, setWidth] = useState(570);
  const w = Math.max(250, width);
  const h = 216, izq = 37, der = 11, sup = 20, inf = 34;
  const maximo = Math.max(1, ...datos.map(d => d.valor));
  const alto = h - sup - inf;
  const ancho = w - izq - der;
  const puntos = datos.map((d, i) => ({
    x: izq + (datos.length <= 1 ? 0 : (i * ancho) / (datos.length - 1)),
    y: sup + alto * (1 - d.valor / maximo),
  }));
  return (
    <View onLayout={e => setWidth(Math.max(250, Math.floor(e.nativeEvent.layout.width)))} style={{ width: '100%', gap: 7 }}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {[0, 0.5, 1].map((t) => {
          const y = sup + alto * t;
          const valor = Math.round(maximo * (1 - t));
          return <React.Fragment key={t}>
            <Line x1={izq} x2={w - der} y1={y} y2={y} stroke="#E5EDF5" strokeWidth={1}/>
            <SvgText x={izq - 6} y={y + 4} fontSize={10} fill="#64748B" textAnchor="end">{valor}</SvgText>
          </React.Fragment>;
        })}
        {puntos.length > 1 ? <Polyline points={puntos.map(p => `${p.x},${p.y}`).join(' ')} stroke={color} fill="none" strokeWidth={2.8} strokeLinejoin="round" strokeLinecap="round"/> : null}
        {puntos.map((p, i) => <Circle key={`${i}`} cx={p.x} cy={p.y} r={3.6} fill={color} stroke="#FFFFFF" strokeWidth={1.2}/>)}
        {datos.map((d, i) => i % 2 === 0 || i === datos.length - 1 ?
          <SvgText key={`et-${d.key}`} x={puntos[i]?.x ?? izq} y={h - 12} fontSize={10} fill="#64748B" textAnchor="middle">{d.label}</SvgText> : null)}
      </Svg>
      <Text style={styles.graficaNota}>Cantidad de registros por mes · Últimos 12 meses</Text>
    </View>
  );
}

export function EtiquetaEstado({ valor, tono = 'info' }: { valor: string; tono?: Tono }) {
  const p = tintas[tono];
  return <View style={{ backgroundColor: p.b, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' }}>
    <Text style={{ fontWeight: '700', fontSize: 11, color: p.t }}>{valor}</Text>
  </View>;
}

const styles = StyleSheet.create({
  kpi: { minHeight: 128, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13, borderRadius: 13, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface },
  icono: { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  kpiValor: { color: colors.text, fontSize: 28, fontWeight: '800' },
  kpiEtiqueta: { color: colors.text, fontSize: 12, fontWeight: '700' },
  kpiDetalle: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  acceso: { borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface },
  accesoIcono: { width: 38, height: 38, borderRadius: 9, backgroundColor: colors.infoLight, alignItems: 'center', justifyContent: 'center' },
  accesoTitulo: { fontSize: 13, fontWeight: '700', color: colors.text },
  accesoDetalle: { color: colors.muted, fontSize: 11 },
  vacio: { paddingVertical: 28, gap: 8, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 19 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  titulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  detalle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filaLabel: { color: colors.text, fontSize: 12, fontWeight: '600' },
  filaCantidad: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  track: { width: '100%', height: 9, borderRadius: 99, backgroundColor: '#ECF1F7', overflow: 'hidden' },
  graficaNota: { textAlign: 'center', fontSize: 11, color: colors.muted },
});
