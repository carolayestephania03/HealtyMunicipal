import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

type Props = { title: string; description?: string };
export function EmptyState({ title, description }: Props) {
  return <View style={styles.empty}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 35, gap: 9 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  description: { maxWidth: 500, fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: 'center' },
});
