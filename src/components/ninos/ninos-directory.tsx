import { type Href, router } from 'expo-router';
import { Eye, Pencil, Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { FilterSelect } from '@/components/ninos/filter-select';
import { VaccinationBadge } from '@/components/ninos/vaccination-badge';
import { Brand, TABLET_BREAKPOINT } from '@/constants/brand';
import {
  COMUNIDADES,
  formatDpi,
  matchesAgeRange,
  matchesSearch,
  matchesVaccinationStatus,
  NINOS,
} from '@/data/ninos';
import type { AgeRangeFilter, Nino, VaccinationStatusFilter } from '@/types/nino';

const AGE_OPTIONS = [
  { label: 'Rango de edad', value: 'todos' },
  { label: '0 a 5 años', value: '0-5' },
  { label: '6 a 17 años', value: '6-17' },
];

const VACCINATION_OPTIONS = [
  { label: 'Estado de vacunación', value: 'todos' },
  { label: 'Al día (80% o más)', value: 'al_dia' },
  { label: 'En seguimiento (50-79%)', value: 'seguimiento' },
  { label: 'Atrasado (menos de 50%)', value: 'atrasado' },
];

export function NinosDirectory() {
  const { width } = useWindowDimensions();
  const compact = width < TABLET_BREAKPOINT;
  const [query, setQuery] = useState('');
  const [comunidad, setComunidad] = useState('todas');
  const [ageRange, setAgeRange] = useState<AgeRangeFilter>('todos');
  const [vaccination, setVaccination] = useState<VaccinationStatusFilter>('todos');

  const communityOptions = useMemo(
    () => [
      { label: 'Comunidad', value: 'todas' },
      ...COMUNIDADES.map((name) => ({ label: name, value: name })),
    ],
    []
  );

  const children = useMemo(() => {
    return NINOS.filter((nino) => {
      const byCommunity = comunidad === 'todas' || nino.comunidad === comunidad;
      return (
        byCommunity &&
        matchesAgeRange(nino.edad, ageRange) &&
        matchesVaccinationStatus(nino.vacunacion, vaccination) &&
        matchesSearch(nino, query)
      );
    });
  }, [ageRange, comunidad, query, vaccination]);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-5 pb-8">
      <Text className="text-app-2xl font-bold text-slate-900">Listado de Niños Registrados</Text>
      <Text className="mt-1 text-app-base text-slate-500">SCCVI · Personal de salud</Text>

      <View className={`mt-5 gap-3 ${compact ? '' : 'flex-row items-center'}`}>
        <View className="flex-1 flex-row items-center rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <Search size={20} color={Brand.textMuted} />
          <TextInput
            className="ml-2 flex-1 text-app-base text-slate-800"
            placeholder="Búsqueda de niño (nombre, CUI/DPI de madre/padre)..."
            placeholderTextColor={Brand.textMuted}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Buscar niño por nombre o DPI de madre o padre"
          />
        </View>
        <Pressable
          onPress={() => router.push('/ninos/nuevo' as Href)}
          className="h-12 flex-row items-center justify-center rounded-lg bg-petroleum px-4"
          accessibilityRole="button"
          accessibilityLabel="Agregar nuevo niño">
          <Plus size={20} color="#ffffff" />
          <Text className="ml-2 text-app-base font-semibold text-white">Agregar nuevo niño</Text>
        </Pressable>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-3">
        <FilterSelect
          label="Comunidad"
          value={comunidad}
          options={communityOptions}
          onChange={setComunidad}
        />
        <FilterSelect
          label="Rango de edad"
          value={ageRange}
          options={AGE_OPTIONS}
          onChange={(value) => setAgeRange(value as AgeRangeFilter)}
        />
        <FilterSelect
          label="Estado de vacunación"
          value={vaccination}
          options={VACCINATION_OPTIONS}
          onChange={(value) => setVaccination(value as VaccinationStatusFilter)}
        />
      </View>

      <View className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
        {compact ? (
          children.length ? (
            children.map((nino, index) => (
              <View
                key={nino.id}
                className={`p-4 ${index < children.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <NinoCard nino={nino} />
              </View>
            ))
          ) : (
            <EmptyState />
          )
        ) : (
          <View>
            <View className="flex-row items-center border-b border-slate-200 bg-slate-50 px-4 py-3">
              <HeaderCell label="Nombre" className="flex-[1.4]" />
              <HeaderCell label="Edad" className="w-14" />
              <HeaderCell label="DPI madre" className="flex-1" />
              <HeaderCell label="DPI padre" className="flex-1" />
              <HeaderCell label="Vacunación" className="w-[108px]" />
              <HeaderCell label="Peso (kg)" className="w-[84px]" />
              <HeaderCell label="Medida (cm)" className="w-[96px]" />
              <HeaderCell label="Acciones" className="w-[136px]" />
            </View>
            {children.length ? (
              children.map((nino, index) => (
                <View
                  key={nino.id}
                  className={`flex-row items-center px-4 py-4 ${
                    index < children.length - 1 ? 'border-b border-slate-100' : ''
                  }`}>
                  <View className="flex-[1.4] pr-2">
                    <Text className="text-app-base font-semibold text-slate-900">{nino.nombre}</Text>
                  </View>
                  <View className="w-14">
                    <Text className="text-app-base text-slate-700">{nino.edad}</Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-app-sm text-slate-700">{formatDpi(nino.dpiMadre)}</Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-app-sm text-slate-700">{formatDpi(nino.dpiPadre)}</Text>
                  </View>
                  <View className="w-[108px]">
                    <VaccinationBadge percent={nino.vacunacion} />
                  </View>
                  <View className="w-[84px]">
                    <Text className="text-app-base text-slate-700">{nino.ultimoPesoKg.toFixed(1)}</Text>
                  </View>
                  <View className="w-[96px]">
                    <Text className="text-app-base text-slate-700">{nino.ultimaMedidaCm}</Text>
                  </View>
                  <View className="w-[136px]">
                    <NinoActions ninoId={nino.id} />
                  </View>
                </View>
              ))
            ) : (
              <EmptyState />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function HeaderCell({ label, className }: { label: string; className: string }) {
  return (
    <View className={className}>
      <Text className="text-app-sm font-semibold uppercase tracking-wide text-slate-500">{label}</Text>
    </View>
  );
}

function NinoCard({ nino }: { nino: Nino }) {
  return (
    <View>
      <Text className="text-app-lg font-semibold text-slate-900">{nino.nombre}</Text>
      <View className="mt-3 gap-2">
        <InfoLine label="Edad" value={`${nino.edad} años`} />
        <InfoLine label="DPI madre" value={formatDpi(nino.dpiMadre)} />
        <InfoLine label="DPI padre" value={formatDpi(nino.dpiPadre)} />
        <View className="flex-row items-center justify-between">
          <Text className="text-app-sm text-slate-500">Estado de vacunación</Text>
          <VaccinationBadge percent={nino.vacunacion} />
        </View>
        <InfoLine label="Último peso" value={`${nino.ultimoPesoKg.toFixed(1)} kg`} />
        <InfoLine label="Última medida" value={`${nino.ultimaMedidaCm} cm`} />
      </View>
      <View className="mt-4">
        <NinoActions ninoId={nino.id} />
      </View>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-app-sm text-slate-500">{label}</Text>
      <Text className="text-app-base font-medium text-slate-800">{value}</Text>
    </View>
  );
}

function NinoActions({ ninoId }: { ninoId: string }) {
  return (
    <View className="gap-2">
      <Pressable
        onPress={() => router.push(`/ninos/${ninoId}` as Href)}
        className="flex-row items-center"
        accessibilityRole="button"
        accessibilityLabel="Ver información">
        <Eye size={18} color={Brand.petroleum} />
        <Text className="ml-2 text-app-sm font-semibold text-petroleum">Ver información</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push(`/ninos/${ninoId}/editar` as Href)}
        className="flex-row items-center"
        accessibilityRole="button"
        accessibilityLabel="Editar">
        <Pencil size={18} color={Brand.petroleum} />
        <Text className="ml-2 text-app-sm font-semibold text-petroleum">Editar</Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center px-6 py-10">
      <Text className="text-app-lg font-semibold text-slate-800">Sin resultados</Text>
      <Text className="mt-2 text-center text-app-base text-slate-500">
        No hay niños que coincidan con la búsqueda o los filtros seleccionados.
      </Text>
    </View>
  );
}
