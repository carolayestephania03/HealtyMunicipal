import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';

type Props = { children: ReactNode };
export function ScreenContainer({ children }: Props) {
  const { isMobile } = useResponsive();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { padding: isMobile ? 16 : 24 }]}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { flexGrow: 1 },
  inner: { width: '100%', maxWidth: 1450, alignSelf: 'center', gap: 18 },
});
