import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ModulePlaceholder } from '../../../../components/common/module-placeholder';
export default function DetalleNino() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ModulePlaceholder title="Expediente del niño" description={`Consulta del registro ${id ?? ''}.`} nextStep="Se integrarán los datos personales, curvas OMS y carnet de vacunación del niño." />;
}
