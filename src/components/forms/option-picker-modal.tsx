
import React from 'react';

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { SearchInput } from '../ui/search-input';
import { AppButton } from '../ui/app-button';

export type PickerOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: readonly PickerOption[];

  selectedValues: readonly string[];
  onSelect: (value: string) => void;
  onClose: () => void;

  multiple?: boolean;
  onConfirm?: () => void;
  confirmDisabled?: boolean;

  query: string;
  onQueryChange: (value: string) => void;

  loading?: boolean;
  emptyMessage?: string;
  limitMessage?: string;
};

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValues,
  onSelect,
  onClose,
  multiple = false,
  onConfirm,
  confirmDisabled = false,
  query,
  onQueryChange,
  loading = false,
  emptyMessage = 'No se encontraron resultados.',
  limitMessage,
}: OptionPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        {/* Cerrar al presionar fuera */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar ventana"
        />

        <View style={styles.panel}>

          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {title}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar selección"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close-outline"
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          {/* Buscador */}
          <SearchInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Buscar opción..."
          />

          {/* Lista */}
          <FlatList
            data={[...options]}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ListHeaderComponent={
              loading ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loading}
                />
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.empty}>
                  {emptyMessage}
                </Text>
              ) : null
            }
            renderItem={({ item }) => {
              const selected =
                selectedValues.includes(item.value);

              return (
                <Pressable
                  accessibilityRole={
                    multiple ? 'checkbox' : 'radio'
                  }
                  accessibilityLabel={item.label}
                  accessibilityState={{
                    checked: selected,
                    disabled: !!item.disabled,
                  }}
                  disabled={item.disabled}
                  onPress={() => onSelect(item.value)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.selectedOption,
                    pressed && styles.pressed,
                    item.disabled && styles.disabled,
                  ]}
                >
                  <Ionicons
                    name={
                      multiple
                        ? selected
                          ? 'checkbox'
                          : 'square-outline'
                        : selected
                          ? 'radio-button-on'
                          : 'radio-button-off'
                    }
                    size={23}
                    color={
                      selected
                        ? colors.primary
                        : colors.muted
                    }
                  />

                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>
                      {item.label}
                    </Text>

                    {item.description && (
                      <Text style={styles.description}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            }}
          />

          {limitMessage && (
            <Text style={styles.helper}>
              {limitMessage}
            </Text>
          )}

          {/* Acciones para selección múltiple */}
          {multiple && (
            <View style={styles.footer}>
              <AppButton
                label="Cancelar"
                variant="outline"
                onPress={onClose}
              />

              <AppButton
                label={`Aplicar (${selectedValues.length})`}
                icon="checkmark-outline"
                disabled={confirmDisabled}
                onPress={onConfirm}
              />
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  panel: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 16,
    gap: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    maxHeight: 360,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },

  selectedOption: {
    backgroundColor: colors.infoLight,
    borderRadius: 8,
  },

  optionText: {
    flex: 1,
    gap: 3,
  },

  optionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  loading: {
    marginVertical: 12,
  },

  empty: {
    color: colors.muted,
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 13,
  },

  helper: {
    color: colors.muted,
    fontSize: 12,
  },

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.4,
  },
});
