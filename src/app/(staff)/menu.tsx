import React from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/screen-container';
import { ScreenHeader } from '../../components/layout/screen-header';
import { NAV_GROUPS } from '../../constants/navigation';
import { colors } from '../../constants/theme';

export default function Menu() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Todos los módulos" description="Acceso a las funciones disponibles del SCCVI." />
      {NAV_GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.items.map(item => (
            <Pressable accessibilityRole="button" onPress={() => router.navigate(item.href as Href)} key={item.href} style={styles.item}>
              <Text style={styles.symbol}>{item.symbol}</Text><Text style={styles.name}>{item.label}</Text><Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  group: { gap: 6 },
  groupTitle: { fontWeight: '700', fontSize: 11, color: colors.muted, marginBottom: 5 },
  item: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 13 },
  symbol: { fontSize: 20, color: colors.primary, width: 25 },
  name: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  arrow: { fontSize: 22, color: colors.primary },
});
