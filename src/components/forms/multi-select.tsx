
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

export type MultiSelectOption = PickerOption;

type MultiSelectProps = {
  label: string;

  value: readonly string[];
  onChange: (values: string[]) => void;

  options: readonly MultiSelectOption[];

  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;

  error?: string;
  helperText?: string;

  maxSelected?: number;

  loading?: boolean;
  onSearchChange?: (text: string) => void;
  filterLocally?: boolean;
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function MultiSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar elementos...',
  required = false,
  disabled = false,
  clearable = true,
  error,
  helperText,
  maxSelected,
  loading = false,
  onSearchChange,
  filterLocally = true,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  // Selección temporal.
  const [draft, setDraft] = useState<string[]>([]);

  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!filterLocally) return options;

    const term = normalizeText(query);

    if (!term) return options;

    return options.filter((option) =>
      normalizeText(
        `${option.label} ${option.description ?? ''}`
      ).includes(term)
    );
  }, [query, options, filterLocally]);

  const selectedLabels = value
    .map((id) =>
      options.find((option) => option.value === id)
        ?.label
    )
    .filter((label): label is string => !!label);

  const displayValue =
    value.length === 0
      ? placeholder
      : selectedLabels.length !== value.length
        ? `${value.length} elementos seleccionados`
        : selectedLabels.length <= 2
          ? selectedLabels.join(', ')
          : `${selectedLabels.slice(0, 2).join(', ')} +${
              selectedLabels.length - 2
            }`;

  const openPicker = () => {
    if (disabled) return;

    setDraft([...value]);
    setQuery('');
    onSearchChange?.('');
    setOpen(true);
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearchChange?.(text);
  };

  const toggleValue = (selectedValue: string) => {
    setDraft((current) => {
      const exists = current.includes(selectedValue);

      if (exists) {
        return current.filter(
          (item) => item !== selectedValue
        );
      }

      if (
        maxSelected !== undefined &&
        current.length >= maxSelected
      ) {
        return current;
      }

      return [...current, selectedValue];
    });
  };

  const confirmSelection = () => {
    onChange([...draft]);
    setOpen(false);
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={
        helperText ??
        (value.length > 0
          ? `${value.length} elementos seleccionados`
          : undefined)
      }
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
            name="list-outline"
            size={19}
            color={colors.muted}
          />

          <Text
            numberOfLines={2}
            style={[
              styles.fieldText,
              value.length === 0 && styles.placeholder,
            ]}
          >
            {displayValue}
          </Text>

          <Ionicons
            name="chevron-down-outline"
            size={18}
            color={colors.muted}
          />
        </Pressable>

        {clearable && !required && value.length > 0 &&
          !disabled && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar selección"
              onPress={() => onChange([])}
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
        multiple
        selectedValues={draft}
        onSelect={toggleValue}
        onClose={() => setOpen(false)}
        onConfirm={confirmSelection}
        confirmDisabled={
          required && draft.length === 0
        }
        query={query}
        onQueryChange={handleSearch}
        loading={loading}
        emptyMessage="No se encontraron opciones."
        limitMessage={
          maxSelected !== undefined
            ? `Máximo permitido: ${maxSelected}`
            : undefined
        }
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
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  fieldText: {
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
