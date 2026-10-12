
import React from 'react';

import {
  useLocalSearchParams,
} from 'expo-router';

import {
  NinoForm,
} from '../../../../features/ninos/components/nino-form';

export default function EditarNino() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  return <NinoForm id={id} />;
}
