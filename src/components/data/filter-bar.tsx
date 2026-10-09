import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { children: ReactNode };
export function FilterBar({ children }: Props) {
  return <View style={styles.filters}>{children}</View>;
}
const styles = StyleSheet.create({ filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 } });
