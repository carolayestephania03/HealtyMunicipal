
import React, {
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius } from '../../constants/theme';
import { FormField } from './form-field';

import {
  OptionPickerModal,
  PickerOption,
} from './option-picker-modal';

export type SearchSelectOption = PickerOption;

type SearchSelectProps = {
  label: string;

  value: string | null;
  onChange: (value: string | null) => void;

  options: readonly SearchSelectOption[];
  selectedOption?: SearchSelectOption | null;

  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;

  error?: string;
  helperText?: string;

  loading?: boolean;

  // Para consultas remotas a la API.
  onSearchChange?: (text: string) => void;

  // Desactivar cuando los resultados ya
  // vienen filtrados desde la API.
  filterLocally?: boolean;
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SearchSelect({
  label,
  value,
  onChange,
  options,
  selectedOption,
  placeholder = 'Buscar y seleccionar...',
  required = false,
  disabled = false,
  clearable = true,
  error,
  helperText,
  loading = false,
  onSearchChange,
  filterLocally = true,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected =
    options.find((item) => item.value === value) ??
    (selectedOption?.value === value
      ? selectedOption
      : undefined);

  const filteredOptions = useMemo(() => {
    if (!filterLocally) return options;

    const term = normalizeText(query);

    if (!term) return options;

    return options.filter((item) =>
      normalizeText(
        `${item.label} ${item.description ?? ''}`
      ).includes(term)
    );
  }, [options, query, filterLocally]);

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearchChange?.(text);
  };

  const openPicker = () => {
    if (disabled) return;

    setQuery('');
    onSearchChange?.('');
    setOpen(true);
  };

  const selectValue = (selectedValue: string) => {
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
      <View style={styles.wrapper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{
            disabled,
            expanded: open,
          }}
          disabled={disabled}
          onPress={openPicker}
          style={[
            styles.field,
            error && styles.invalid,
            disabled && styles.disabled,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.muted}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.value,
              !selected && styles.placeholder,
            ]}
          >
            {selected?.label ??
              (value ? 'Registro seleccionado' : placeholder)}
          </Text>

          <Ionicons
            name="chevron-down-outline"
            size={18}
            color={colors.muted}
          />
        </Pressable>

        {clearable && !required && !!value && !disabled && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar selección"
            onPress={() => onChange(null)}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>

      <OptionPickerModal
        visible={open}
        title={label}
        options={filteredOptions}
        selectedValues={value ? [value] : []}
        onSelect={selectValue}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={handleSearch}
        loading={loading}
        emptyMessage="No se encontraron registros."
      />

    </FormField>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  field: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  value: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  placeholder: {
    color: colors.muted,
  },

  clearButton: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  invalid: {
    borderColor: colors.danger,
  },

  disabled: {
    opacity: 0.45,
  },
});
