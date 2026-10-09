
import React, { ReactNode } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { colors } from '../../constants/theme';

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  style,
}: FormFieldProps) {
  return (
    <View style={[styles.container, style]}>

      <Text style={styles.label}>
        {label}
        {required && (
          <Text style={styles.required}> *</Text>
        )}
      </Text>

      <View style={styles.control}>
        {children}
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helper}>
          {helperText}
        </Text>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 0,
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },

  required: {
    color: colors.danger,
  },

  control: {
    width: '100%',
    minWidth: 0,
  },

  helper: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },

  error: {
    fontSize: 11,
    color: colors.danger,
    lineHeight: 16,
  },
});
