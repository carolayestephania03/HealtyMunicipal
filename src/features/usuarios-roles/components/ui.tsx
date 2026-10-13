import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function Accion({ icon, texto, onPress, secundario = false, disabled = false }: {
  icon: IconName; texto: string; onPress: () => void; secundario?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={texto} disabled={disabled}
    onPress={onPress} style={[styles.button, secundario && styles.secondary, disabled && { opacity: .55 }]}>
    <Ionicons name={icon} size={17} color={secundario ? colors.primary : '#FFFFFF'} />
    <Text style={[styles.btnText, secundario && { color: colors.primary }]}>{texto}</Text>
  </Pressable>;
}
export function Etiqueta({ activo }: { activo: boolean }) {
  return <View style={[styles.tag, { backgroundColor: activo ? colors.successLight : colors.dangerLight }]}>
    <Text style={{ color: activo ? colors.success : colors.danger, fontWeight: '700', fontSize: 12 }}>
      {activo ? 'Activo' : 'Inactivo'}
    </Text>
  </View>;
}
export function Campo({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, maxLength, autoCapitalize }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad'; maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder}
      autoCapitalize={autoCapitalize ?? 'sentences'} keyboardType={keyboardType ?? 'default'} maxLength={maxLength}
      secureTextEntry={secureTextEntry} placeholderTextColor="#8A96A7" />
  </View>;
}
export function Aviso({ mensaje, error = true }: { mensaje?: string | null; error?: boolean }) {
  if (!mensaje) return null;
  return <View style={[styles.notice, { backgroundColor: error ? colors.dangerLight : colors.infoLight }]}>
    <Ionicons name={error ? 'alert-circle-outline' : 'information-circle-outline'} color={error ? colors.danger : colors.primary} size={19} />
    <Text style={{ flex: 1, color: error ? colors.danger : colors.primary, fontSize: 13 }}>{mensaje}</Text>
  </View>;
}
export function Dato({ titulo, valor }: { titulo: string; valor?: string | number | null }) {
  return <View style={styles.datum}><Text style={styles.label}>{titulo}</Text>
    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{valor === null || valor === undefined || valor === '' ? 'No asignado' : String(valor)}</Text>
  </View>;
}
export const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11,
    flexDirection: 'row', gap: 7, alignItems: 'center', alignSelf: 'flex-start' },
  secondary: { backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1 },
  btnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  tag: { borderRadius: 16, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5 },
  field: { flex: 1, minWidth: 220, gap: 7, marginBottom: 12 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: colors.text },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 10 },
  datum: { gap: 5, marginBottom: 11, minWidth: 180, flex: 1 },
  panel: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 18, gap: 16 },
  panelTitle: { fontWeight: '800', color: colors.text, fontSize: 18 },
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
});
