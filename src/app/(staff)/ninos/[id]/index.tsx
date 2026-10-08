import { type Href, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { NinoDetailCard } from '@/components/ninos/nino-detail-card';
import { getNinoById } from '@/data/ninos';

export default function NinoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nino = id ? getNinoById(id) : undefined;

  if (!nino) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-5">
        <Text className="text-app-lg font-semibold text-slate-800">Niño no encontrado</Text>
      </View>
    );
  }

  return (
    <NinoDetailCard
      nino={nino}
      title="Información del niño"
      onEdit={() => router.push(`/ninos/${nino.id}/editar` as Href)}
    />
  );
}
