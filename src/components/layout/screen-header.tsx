import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { AppButton } from '../ui/app-button';

type Props = { title: string; description?: string; actionLabel?: string; onAction?: () => void };
export function ScreenHeader({ title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' },
  heading: { flex: 1, minWidth: 220, gap: 4 },
  title: { fontWeight: '800', fontSize: 29, color: colors.text },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
