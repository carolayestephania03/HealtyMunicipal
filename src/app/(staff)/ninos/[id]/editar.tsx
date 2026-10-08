import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { NinoForm } from '@/components/ninos/nino-form';
import { getNinoById } from '@/data/ninos';

export default function EditarNinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nino = id ? getNinoById(id) : undefined;

  if (!nino) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-5">
        <Text className="text-app-lg font-semibold text-slate-800">Niño no encontrado</Text>
      </View>
    );
  }

  return <NinoForm title="Editar niño" submitLabel="Guardar cambios" initial={nino} />;
}
