import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ModulePlaceholder } from '../../../../components/common/module-placeholder';
export default function EditarNino() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ModulePlaceholder title="Editar información del niño" description={`Edición del registro ${id ?? ''}.`} nextStep="Se implementará la carga, edición y validación de información real desde la API." />;
}
