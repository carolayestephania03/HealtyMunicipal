import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { FormPanel } from '../../../components/forms/form-panel';
import { TextField } from '../../../components/ui/text-field';
import { AppButton } from '../../../components/ui/app-button';
import { colors } from '../../../constants/theme';

export function NinoForm() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [responsable, setResponsable] = useState('');
  return (
    <ScreenContainer>
      <ScreenHeader title="Registrar niño" description="Estructura inicial del formulario. No se enviarán datos hasta implementar el servicio, la validación y la asociación familiar." />
      <FormPanel title="Información del niño">
        <View style={styles.fields}>
          <TextField label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Ingrese el nombre completo" required />
          <TextField label="Fecha de nacimiento" value={fecha} onChangeText={setFecha} placeholder="AAAA-MM-DD" required />
        </View>
        <Text style={styles.note}>Pendiente: catálogo de comunidades, selección de tutor, validación, y conexión con PostgreSQL mediante la API.</Text>
        <AppButton label="Guardar registro (pendiente de API)" disabled />
      </FormPanel>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
