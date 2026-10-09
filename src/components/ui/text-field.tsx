import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../../constants/theme';

type Props = TextInputProps & { label: string; required?: boolean; error?: string };
export function TextField({ label, required, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}{required ? <Text style={{ color: colors.danger }}> *</Text> : null}</Text>
      <TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, error ? styles.invalid : undefined, style]} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 6, flexGrow: 1, flexBasis: 220 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', color: colors.text, borderRadius: radius.sm, minHeight: 43, paddingHorizontal: 12, fontSize: 14 },
  invalid: { borderColor: colors.danger },
  error: { fontSize: 11, color: colors.danger },
});
