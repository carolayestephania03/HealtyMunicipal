import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../../constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({ label, onPress, variant = 'primary', disabled = false, style }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : variant === 'outline' ? styles.outline : styles.secondary,
        pressed && !disabled ? { opacity: 0.8 } : undefined,
        disabled ? { opacity: 0.45 } : undefined,
        style,
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? '#FFFFFF' : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 42, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.infoLight, borderColor: colors.infoLight },
  outline: { backgroundColor: colors.surface, borderColor: colors.primary },
  label: { fontSize: 14, fontWeight: '700' },
});
