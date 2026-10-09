
import React from 'react';

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius } from '../../constants/theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  onSubmit,
}: Props) {
  return (
    <View style={styles.wrapper}>

      <Ionicons
        name="search-outline"
        size={19}
        color={colors.muted}
      />

      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        style={styles.input}
      />

      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          onPress={() => onChangeText('')}
        >
          <Ionicons
            name="close-circle"
            size={19}
            color={colors.muted}
          />
        </Pressable>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 44,
    minWidth: 0,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 9,
  },
});
