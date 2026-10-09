import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

type Props = { label: string; tone?: 'success' | 'warning' | 'danger' | 'info' };
const palettes = {
  success: { fg: colors.success, bg: colors.successLight },
  warning: { fg: colors.warning, bg: colors.warningLight },
  danger: { fg: colors.danger, bg: colors.dangerLight },
  info: { fg: colors.info, bg: colors.infoLight },
};
export function StatusBadge({ label, tone = 'info' }: Props) {
  const p = palettes[tone];
  return <View style={[styles.badge, { backgroundColor: p.bg }]}><Text style={[styles.text, { color: p.fg }]}>{label}</Text></View>;
}
const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingVertical: 5, paddingHorizontal: 10 },
  text: { fontSize: 12, fontWeight: '700' },
});
