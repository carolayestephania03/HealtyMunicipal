
import React, { useState } from 'react';

import {
  Text,
  StyleSheet,
} from 'react-native';

import { router } from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';

import { FormPanel } from '../../../components/forms/form-panel';
import { RadioGroup } from '../../../components/forms/radio-group';
import { SearchSelect } from '../../../components/forms/search-select';
import { DateField } from '../../../components/forms/date-field';
import { TextAreaField } from '../../../components/forms/text-area-field';

import { TextField } from '../../../components/ui/text-field';
import { AppButton } from '../../../components/ui/app-button';
import { StatusBadge } from '../../../components/ui/status-badge';

import { SummaryGrid } from '../../../components/common/summary-grid';

import { colors } from '../../../constants/theme';

// Registros ficticios para comprobar la selección.
const DEMO_TUTORES = [
  {
    value: 'demo-1',
    label: 'Tutor de prueba 01',
    description: 'Responsable ficticio',
  },
  {
    value: 'demo-2',
    label: 'Tutor de prueba 02',
    description: 'Responsable ficticio',
  },
  {
    value: 'demo-3',
    label: 'Tutor de prueba 03',
    description: 'Responsable ficticio',
  },
];

export function NinoForm() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState('');

  const [tutorId, setTutorId] =
    useState<string | null>(null);

  const [observaciones, setObservaciones] =
    useState('');

  const camposCompletados = [
    nombre.trim().length > 0,
    fecha.length === 10,
    sexo.length > 0,
    tutorId !== null,
  ].filter(Boolean).length;

  return (
    <ScreenContainer>

      <ScreenHeader
        title="Registrar niño"
        description="Complete la información correspondiente al nuevo registro."
      />

      <FormPanel
        title="Información personal del niño"
        description="Ingrese los datos del niño y seleccione al responsable correspondiente."
        icon="person-add-outline"
        status={
          <StatusBadge
            label="Nuevo registro"
            tone="info"
          />
        }
        footer={
          <>
            <AppButton
              label="Cancelar"
              variant="outline"
              onPress={() => router.back()}
            />

            <AppButton
              label="Guardar registro"
              icon="save-outline"
              disabled
            />
          </>
        }
      >

        <ResponsiveGrid
          maxColumns={2}
          minItemWidth={240}
          gap={16}
        >
          <TextField
            label="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre y apellidos"
            required
          />

          <DateField
            label="Fecha de nacimiento"
            value={fecha}
            onChangeText={setFecha}
            required
          />

          <RadioGroup
            label="Sexo"
            value={sexo}
            onChange={setSexo}
            required
            options={[
              {
                label: 'Masculino',
                value: 'M',
              },
              {
                label: 'Femenino',
                value: 'F',
              },
            ]}
          />

          <SearchSelect
            label="Padre, madre o tutor"
            value={tutorId}
            onChange={setTutorId}
            options={DEMO_TUTORES}
            placeholder="Buscar responsable..."
            required
          />
        </ResponsiveGrid>

        <TextAreaField
          label="Observaciones"
          placeholder="Escriba las observaciones correspondientes..."
          value={observaciones}
          onChangeText={setObservaciones}
          rows={4}
        />

        <SummaryGrid
          items={[
            {
              label: 'Campos completados',
              value: `${camposCompletados}/4`,
              icon: 'list-outline',
              tone: 'info',
            },
            {
              label: 'Responsable',
              value: tutorId
                ? 'Seleccionado'
                : 'Pendiente',
              icon: 'people-outline',
              tone: tutorId
                ? 'success'
                : 'warning',
            },
            {
              label: 'Registro',
              value: 'Sin guardar',
              icon: 'save-outline',
              tone: 'neutral',
            },
          ]}
        />

        <Text style={styles.note}>
          Vista de demostración. Los responsables
          son ficticios y el registro no se enviará
          a la base de datos hasta implementar
          los servicios y validaciones.
        </Text>

      </FormPanel>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
  },
});
