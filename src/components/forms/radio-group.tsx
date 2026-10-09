
import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { FormField } from './form-field';

export type RadioOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

type RadioGroupProps = {
  label: string;
  value?: string;

  options: readonly RadioOption[];

  onChange: (value: string) => void;

  direction?: 'row' | 'column';

  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
};

export function RadioGroup({
  label,
  value,
  options,
  onChange,
  direction = 'row',
  required = false,
  disabled = false,
  error,
  helperText,
}: RadioGroupProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <View
        accessibilityRole="radiogroup"
        style={[
          styles.container,
          direction === 'column' && styles.column,
        ]}
      >
        {options.map((option) => {
          const selected = value === option.value;

          const isDisabled =
            disabled || !!option.disabled;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{
                checked: selected,
                disabled: isDisabled,
              }}
              disabled={isDisabled}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressed,
                isDisabled && styles.disabled,
              ]}
            >
              <Ionicons
                name={
                  selected
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={
                  selected
                    ? colors.primary
                    : colors.muted
                }
              />

              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>

                {option.description && (
                  <Text style={styles.description}>
                    {option.description}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  column: {
    flexDirection: 'column',
  },

  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexGrow: 1,
    flexBasis: 130,
  },

  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.infoLight,
  },

  textContainer: {
    flex: 1,
    gap: 3,
  },

  optionLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },

  selectedText: {
    color: colors.primary,
    fontWeight: '700',
  },

  description: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.45,
  },
});
