
import React, { useState } from 'react';

import {
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { colors, radius } from '../../constants/theme';
import { FormField } from '../forms/form-field';

export type TextFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  required = false,
  error,
  helperText,
  containerStyle,
  style,
  editable = true,
  onFocus,
  onBlur,
  accessibilityLabel,
  placeholderTextColor,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      style={containerStyle}
    >
      <TextInput
        {...props}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !editable }}
        placeholderTextColor={
          placeholderTextColor ?? colors.muted
        }
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          error ? styles.invalid : undefined,
          !editable && styles.disabled,
          style,
        ]}
      />
    </FormField>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
  },

  focused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  invalid: {
    borderColor: colors.danger,
  },

  disabled: {
    backgroundColor: '#F0F3F7',
    opacity: 0.7,
  },
});
