import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { VaccinationBadge } from '@/components/ninos/vaccination-badge';
import { Brand } from '@/constants/brand';
import { formatDpi } from '@/data/ninos';
import type { Nino } from '@/types/nino';

type NinoDetailCardProps = {
  nino: Nino;
  title: string;
  onEdit?: () => void;
};

export function NinoDetailCard({ nino, title, onEdit }: NinoDetailCardProps) {
  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-5 pb-8">
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center self-start"
        accessibilityRole="button"
        accessibilityLabel="Volver">
        <ArrowLeft size={20} color={Brand.petroleum} />
        <Text className="ml-2 text-app-base font-semibold text-petroleum">Volver al listado</Text>
      </Pressable>

      <View className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <Text className="text-app-2xl font-bold text-slate-900">{title}</Text>
        <Text className="mt-1 text-app-lg font-semibold text-slate-800">{nino.nombre}</Text>

        <View className="mt-5 gap-3">
          <DetailRow label="Edad" value={`${nino.edad} años`} />
          <DetailRow label="DPI madre" value={formatDpi(nino.dpiMadre)} />
          <DetailRow label="DPI padre" value={formatDpi(nino.dpiPadre)} />
          <View className="flex-row items-center justify-between border-b border-slate-100 py-2">
            <Text className="text-app-base text-slate-500">Estado de vacunación</Text>
            <VaccinationBadge percent={nino.vacunacion} />
          </View>
          <DetailRow label="Último peso" value={`${nino.ultimoPesoKg.toFixed(1)} kg`} />
          <DetailRow label="Última medida" value={`${nino.ultimaMedidaCm} cm`} />
        </View>

        {onEdit ? (
          <Pressable
            onPress={onEdit}
            className="mt-6 h-12 items-center justify-center rounded-lg bg-petroleum"
            accessibilityRole="button">
            <Text className="text-app-base font-semibold text-white">Editar</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-2">
      <Text className="text-app-base text-slate-500">{label}</Text>
      <Text className="text-app-base font-medium text-slate-800">{value}</Text>
    </View>
  );
}
