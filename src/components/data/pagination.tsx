import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../ui/app-button';
import { colors } from '../../constants/theme';

type Props = { page: number; totalPages: number; onPageChange: (page: number) => void };
export function Pagination({ page, totalPages, onPageChange }: Props) {
  const safeTotal = Math.max(1, totalPages);
  return <View style={styles.row}>
    <AppButton variant="outline" label="Anterior" disabled={page <= 1} onPress={() => onPageChange(page - 1)} />
    <Text style={styles.text}>Página {page} de {safeTotal}</Text>
    <AppButton variant="outline" label="Siguiente" disabled={page >= safeTotal} onPress={() => onPageChange(page + 1)} />
  </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }, text: { color: colors.muted, fontSize: 12 } });
