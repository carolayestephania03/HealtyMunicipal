import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/use-responsive';

type Props = { children: ReactNode; maxColumns?: 2 | 3 | 4 };
export function ResponsiveGrid({ children, maxColumns = 4 }: Props) {
  const { width } = useResponsive();
  const columns = width >= 1280 ? maxColumns : width >= 700 ? Math.min(maxColumns, 2) : 1;
  const itemWidth = columns === 4 ? '23.5%' : columns === 3 ? '31.5%' : columns === 2 ? '48.5%' : '100%';
  return (
    <View style={styles.grid}>
      {React.Children.map(children, (child, i) => (
        <View key={i} style={{ width: itemWidth as `${number}%` }}>{child}</View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } });
