
import React from 'react';

import {
  useLocalSearchParams,
} from 'expo-router';

import {
  NinoDetalle,
} from '../../../../features/ninos/components/nino-detalle';

export default function DetalleNino() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  if (!id) {
    return null;
  }

  return <NinoDetalle id={id} />;
}
