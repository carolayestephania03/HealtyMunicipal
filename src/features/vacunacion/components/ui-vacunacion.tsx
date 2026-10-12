import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../constants/theme';

export function Panel({ title, children, right }: {
  title: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return <View style={s.panel}>
    <View style={s.header}><Text style={s.title}>{title}</Text>{right}</View>
    {children}
  </View>;
}

export function Boton({ label, onPress, disabled, loading, outline, danger }: {
  label: string; onPress: () => void; disabled?: boolean;
  loading?: boolean; outline?: boolean; danger?: boolean;
}) {
  return <Pressable onPress={onPress} disabled={disabled || loading}
    accessibilityRole="button"
    style={[s.button, outline && s.outline, danger && s.danger,
      (disabled || loading) && { opacity: 0.5 }]}>
    {loading ? <ActivityIndicator color={outline ? colors.primary : '#fff'} /> :
      <Text style={[s.buttonText, outline && s.outlineText]}>{label}</Text>}
  </Pressable>;
}

export function Campo({ label, value, onChange, placeholder, multiline, keyboardType, secureTextEntry }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
  multiline?: boolean; keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  secureTextEntry?: boolean;
}) {
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TextInput style={[s.input, multiline && { minHeight: 84, textAlignVertical: 'top' }]}
      value={value} onChangeText={onChange} placeholder={placeholder}
      placeholderTextColor={colors.muted} multiline={multiline}
      keyboardType={keyboardType} secureTextEntry={secureTextEntry} />
  </View>;
}

export function Estado({ estado }: { estado: string }) {
  const fondo = estado === 'APLICADA' || estado === 'ACTIVO' ? colors.successLight :
    estado === 'ATRASADA' || estado === 'BLOQUEADO' ? colors.dangerLight : colors.warningLight;
  const texto = estado === 'APLICADA' || estado === 'ACTIVO' ? colors.success :
    estado === 'ATRASADA' || estado === 'BLOQUEADO' ? colors.danger : colors.warning;
  return <View style={[s.badge, { backgroundColor: fondo }]}>
    <Text style={[s.badgeText, { color: texto }]}>{estado}</Text>
  </View>;
}

export const uiStyles = StyleSheet.create({
  label: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  body: { fontSize: 13, color: colors.text, lineHeight: 20 },
  muted: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  error: { fontSize: 12, color: colors.danger, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  gap: { gap: 12 },
});

const s = StyleSheet.create({
  panel: { borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 16, backgroundColor: colors.surface, gap: 12 },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 39,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 8 },
  outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  outlineText: { color: colors.primary },
  field: { gap: 6, flex: 1, minWidth: 180 },
  label: { fontSize: 12, color: colors.text, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, minHeight: 42,
    padding: 10, backgroundColor: colors.surface, color: colors.text },
  badge: { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
