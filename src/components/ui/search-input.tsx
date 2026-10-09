import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import { colors, radius } from '../../constants/theme';

type Props = { value: string; onChangeText: (value: string) => void; placeholder?: string };
export function SearchInput({ value, onChangeText, placeholder = 'Buscar...' }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 12 },
  icon: { fontSize: 22, color: colors.muted, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 10 },
});
