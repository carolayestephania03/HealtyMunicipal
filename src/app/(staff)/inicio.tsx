import React from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/screen-container';
import { ScreenHeader } from '../../components/layout/screen-header';
import { ResponsiveGrid } from '../../components/layout/responsive-grid';
import { StatCard } from '../../components/ui/stat-card';
import { SectionCard } from '../../components/ui/section-card';
import { colors } from '../../constants/theme';
import { NAV_GROUPS } from '../../constants/navigation';

export default function Inicio() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Inicio" description="Bienvenida al Sistema de Control de Crecimiento y Vacunación Infantil. Gestiona el seguimiento de salud de tu comunidad." />
      <ResponsiveGrid>
        <StatCard value="—" label="Niños registrados" symbol="◉" />
        <StatCard value="—" label="Vacunación al día" symbol="✚" tone="success" />
        <StatCard value="—" label="Controles de crecimiento" symbol="↗" tone="warning" />
        <StatCard value="—" label="Alertas activas" symbol="⚠" tone="danger" />
      </ResponsiveGrid>
      <SectionCard title="Módulos del sistema">
        <Text style={styles.muted}>Selecciona un módulo para continuar. Los datos se incorporarán con la API del SCCVI.</Text>
        <View style={styles.links}>
          {NAV_GROUPS.flatMap((group) => group.items).filter(item => item.href !== '/inicio').map(item => (
            <Pressable key={item.href} onPress={() => router.navigate(item.href as Href)} style={styles.link} accessibilityRole="button">
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>{item.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 13 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  link: { minWidth: 230, flexBasis: 255, flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.canvas, borderRadius: 10, padding: 14 },
  symbol: { color: colors.primary, fontSize: 22, width: 26 },
  name: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '700' },
  arrow: { color: colors.primary, fontSize: 22 },
});
