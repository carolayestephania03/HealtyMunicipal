import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

type SummaryItem = { label: string; value: string; icon?: string };
type Props = { items: SummaryItem[] };
export function SummaryGrid({ items }: Props) {
  return <View style={styles.grid}>{items.map((item) => (
    <View key={item.label} style={styles.item}>
      {item.icon ? <Text style={styles.icon}>{item.icon}</Text> : null}
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.value}>{item.value}</Text>
    </View>
  ))}</View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { minWidth: 125, flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 12, backgroundColor: colors.canvas, gap: 5 },
  icon: { fontSize: 20, color: colors.primary },
  label: { fontSize: 11, color: colors.muted },
  value: { fontSize: 14, fontWeight: '800', color: colors.text },
});
