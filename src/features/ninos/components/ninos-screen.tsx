import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';
import { StatCard } from '../../../components/ui/stat-card';
import { SectionCard } from '../../../components/ui/section-card';
import { SearchInput } from '../../../components/ui/search-input';
import { EmptyState } from '../../../components/feedback/empty-state';
import { FilterBar } from '../../../components/data/filter-bar';

export function NinosScreen() {
const { q } = useLocalSearchParams<{ q?: string }>();

const [search, setSearch] = useState('');

useEffect(() => {
  setSearch(typeof q === 'string' ? q : '');
}, [q]);
  return (
    <ScreenContainer>
      <ScreenHeader title="Niños" description="Registro, consulta y seguimiento de niños atendidos por el centro de salud." actionLabel="+ Registrar niño" onAction={() => router.push('/ninos/nuevo')} />
      <ResponsiveGrid>
        <StatCard value="—" label="Niños registrados" symbol="◉" />
        <StatCard value="—" label="Menores de 2 años" symbol="♧" tone="success" />
        <StatCard value="—" label="Con control reciente" symbol="↗" tone="warning" />
        <StatCard value="—" label="Con vacunas pendientes" symbol="✚" tone="danger" />
      </ResponsiveGrid>
      <SectionCard title="Listado de niños">
        <FilterBar><View style={{ flexGrow: 1, minWidth: 210 }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre, código o responsable..." /></View></FilterBar>
        <EmptyState title="Listado preparado para integrar la API" description={`La búsqueda y los indicadores mostrarán registros reales cuando conectemos el servicio de niños.${search ? ` Texto de búsqueda: ${search}` : ''}`} />
      </SectionCard>
    </ScreenContainer>
  );
}
