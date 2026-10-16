import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../constants/theme';
import type { Id } from '../../vacunacion/types';
import { carnetService } from '../services/carnet.service';
import { Boton, uiStyles } from '../../vacunacion/components/ui-vacunacion';

type Props = {
  idCarnet: Id;
  disabled?: boolean;
  onSuccess?: (mensaje: string) => void;
};

export function CambiarPinCarnet({ idCarnet, disabled = false, onSuccess }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [nuevoPin, setNuevoPin] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    if (guardando) return;
    setAbierto(false);
    setNuevoPin('');
    setConfirmacion('');
    setError(null);
  };

  const guardar = async () => {
    if (guardando) return;
    if (!/^\d{4,8}$/.test(nuevoPin)) {
      setError('El PIN debe tener entre 4 y 8 dígitos numéricos.');
      return;
    }
    if (nuevoPin !== confirmacion) {
      setError('La confirmación del PIN no coincide.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const respuesta = await carnetService.cambiarPin(idCarnet, nuevoPin);
      if (!respuesta.success) {
        throw new Error(respuesta.message || 'No fue posible actualizar el PIN.');
      }
      setAbierto(false);
      setNuevoPin('');
      setConfirmacion('');
      onSuccess?.('PIN actualizado. El padre puede seguir utilizando el QR existente con el nuevo PIN.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar el PIN.');
    } finally {
      setGuardando(false);
    }
  };

  return <>
    <Boton
      label="Cambiar PIN"
      outline
      disabled={disabled}
      onPress={() => { setError(null); setAbierto(true); }}
    />
    <Modal
      visible={abierto}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View style={s.overlay}>
        <View style={s.dialog}>
          <Text style={s.titulo}>Cambiar PIN de acceso</Text>
          <Text style={uiStyles.muted}>
            Defina un PIN numérico nuevo y entréguelo al padre, madre o tutor autorizado.
            No será necesario generar otro código QR.
          </Text>
          <View style={s.campo}>
            <Text style={s.label}>Nuevo PIN (4 a 8 dígitos)</Text>
            <TextInput
              accessibilityLabel="Nuevo PIN"
              style={s.input}
              value={nuevoPin}
              onChangeText={(valor) => setNuevoPin(valor.replace(/\D/g, '').slice(0, 8))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Ingrese el nuevo PIN"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={s.campo}>
            <Text style={s.label}>Confirmar nuevo PIN</Text>
            <TextInput
              accessibilityLabel="Confirmar nuevo PIN"
              style={s.input}
              value={confirmacion}
              onChangeText={(valor) => setConfirmacion(valor.replace(/\D/g, '').slice(0, 8))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Repita el nuevo PIN"
              placeholderTextColor={colors.muted}
            />
          </View>
          {error ? <Text style={uiStyles.error}>{error}</Text> : null}
          <View style={s.acciones}>
            <Boton label="Cancelar" outline disabled={guardando} onPress={cerrar} />
            <Boton
              label="Guardar nuevo PIN"
              loading={guardando}
              disabled={guardando}
              onPress={() => void guardar()}
            />
          </View>
          <Text style={uiStyles.muted}>
            El PIN anterior dejará de funcionar inmediatamente. El estado del carnet no se modifica.
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar ventana" onPress={cerrar} disabled={guardando} style={s.cerrarAccesible}>
            <Text style={uiStyles.muted}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5, 21, 46, 0.60)', justifyContent: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 485, alignSelf: 'center', backgroundColor: colors.surface,
    borderRadius: 14, padding: 20, gap: 14 },
  titulo: { color: colors.text, fontWeight: '800', fontSize: 18 },
  campo: { gap: 6 },
  label: { color: colors.text, fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, minHeight: 45,
    paddingHorizontal: 12, backgroundColor: colors.surface, fontSize: 15, color: colors.text },
  acciones: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  cerrarAccesible: { alignSelf: 'flex-end', padding: 4 },
});
