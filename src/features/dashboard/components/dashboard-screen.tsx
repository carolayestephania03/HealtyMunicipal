import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';
import { StatCard } from '../../../components/ui/stat-card';
import { SectionCard } from '../../../components/ui/section-card';
import { colors } from '../../../constants/theme';

export function DashboardScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Dashboard" description="Resumen general del seguimiento de crecimiento y vacunación infantil." />
      <ResponsiveGrid>
        <StatCard value="—" label="Niños registrados" symbol="◉" />
        <StatCard value="—" label="Cobertura de vacunación" symbol="✚" tone="success" />
        <StatCard value="—" label="Controles del mes" symbol="↗" tone="warning" />
        <StatCard value="—" label="Alertas activas" symbol="⚠" tone="danger" />
      </ResponsiveGrid>
      <ResponsiveGrid maxColumns={2}>
        <SectionCard title="Controles de crecimiento por mes"><View style={styles.graph}><Text style={styles.note}>Gráfica pendiente de conexión</Text></View></SectionCard>
        <SectionCard title="Cobertura de vacunación"><View style={styles.graph}><Text style={styles.note}>Gráfica pendiente de conexión</Text></View></SectionCard>
      </ResponsiveGrid>
      <SectionCard title="Alertas y próximas actividades">
        <Text style={styles.note}>Se mostrarán las alertas y vacunas próximas al conectar los respectivos servicios.</Text>
      </SectionCard>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  graph: { minHeight: 215, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.canvas, borderRadius: 10 },
  note: { fontSize: 13, textAlign: 'center', color: colors.muted },
});
