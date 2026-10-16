
import React, { useState } from 'react';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius } from '../../constants/theme';
import { FormField } from './form-field';

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  label: string;
  value?: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleccione una opción',
  required = false,
  disabled = false,
  error,
  helperText,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      {/* Control principal */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          disabled,
          expanded: open,
        }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.select,
          error && styles.invalid,
          disabled && styles.disabled,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.selectedText,
            !selectedOption && styles.placeholder,
          ]}
        >
          {selectedOption?.label ?? placeholder}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {/* Ventana de opciones */}
      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Cerrar selección"
          />

          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setOpen(false)}
              >
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.optionsList}
              nestedScrollEnabled
            >
              {options.length === 0 && (
                <Text style={styles.emptyText}>
                  No hay opciones disponibles.
                </Text>
              )}

              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    disabled={option.disabled}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                      disabled: option.disabled,
                    }}
                    onPress={() =>
                      handleSelect(option.value)
                    }
                    style={[
                      styles.option,
                      selected && styles.selectedOption,
                      option.disabled && styles.disabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.activeText,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </FormField>
  );
}

const styles = StyleSheet.create({
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    gap: 8,
  },

  selectedText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  placeholder: {
    color: colors.muted,
  },

  invalid: {
    borderColor: colors.danger,
  },

  disabled: {
    opacity: 0.45,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },

  optionsList: {
    maxHeight: 360,
  },

  emptyText: {
    paddingVertical: 20,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  selectedOption: {
    backgroundColor: colors.infoLight,
    borderRadius: 7,
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  activeText: {
    fontWeight: '700',
    color: colors.primary,
  },
});
