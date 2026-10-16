import React, { useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  RegistroCrecimiento,
  ActualizarControlDto,
} from '../types';

import {
  fechaCorta,
} from '../types';

type ValoresControl = Required<
  Pick<
    ActualizarControlDto,
    'fecha_medicion' | 'peso_kg' | 'talla_cm'
  >
> & {
  observaciones: string | null;
};

type Props = {
  fechaNacimiento: string;
  registro?: RegistroCrecimiento | null;

  onSave: (
    valores: ValoresControl
  ) => Promise<void>;

  onCancel: () => void;
};

function hoyLocal(): string {
  const hoy = new Date();

  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');
}

function esFechaValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(`${valor}T00:00:00Z`);

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor
  );
}

export function ControlCrecimientoForm({
  fechaNacimiento,
  registro,
  onSave,
  onCancel,
}: Props) {
  const [fecha, setFecha] = useState(
    registro
      ? fechaCorta(registro.fecha_medicion)
      : hoyLocal()
  );

  const [peso, setPeso] = useState(
    registro ? String(registro.peso_kg) : ''
  );

  const [talla, setTalla] = useState(
    registro ? String(registro.talla_cm) : ''
  );

  const [observaciones, setObservaciones] =
    useState(registro?.observaciones ?? '');

  const [guardando, setGuardando] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const guardar = async () => {
    if (guardando) return;

    setError(null);

    const pesoKg = Number(
      peso.trim().replace(',', '.')
    );

    const tallaCm = Number(
      talla.trim().replace(',', '.')
    );

    if (!esFechaValida(fecha)) {
      setError(
        'Ingrese una fecha válida con formato YYYY-MM-DD.'
      );
      return;
    }

    if (
      fecha > hoyLocal() ||
      fecha < fechaCorta(fechaNacimiento)
    ) {
      setError(
        'La fecha debe estar entre el nacimiento del niño y hoy.'
      );
      return;
    }

    if (
      !peso.trim() ||
      !Number.isFinite(pesoKg) ||
      pesoKg <= 0 ||
      pesoKg > 300
    ) {
      setError(
        'El peso debe ser mayor que 0 y no superar 300 kg.'
      );
      return;
    }

    if (
      !talla.trim() ||
      !Number.isFinite(tallaCm) ||
      tallaCm <= 0 ||
      tallaCm > 250
    ) {
      setError(
        'La talla debe ser mayor que 0 y no superar 250 cm.'
      );
      return;
    }

    if (observaciones.trim().length > 1000) {
      setError(
        'Las observaciones no pueden exceder 1000 caracteres.'
      );
      return;
    }

    setGuardando(true);

    try {
      await onSave({
        fecha_medicion: fecha,
        peso_kg: pesoKg,
        talla_cm: tallaCm,
        observaciones: observaciones.trim() || null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el control.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {registro
          ? 'Editar control de crecimiento'
          : 'Registrar control de crecimiento'}
      </Text>

      <Text style={styles.descripcion}>
        El sistema calculará automáticamente la edad,
        el IMC y los indicadores OMS disponibles.
      </Text>

      <View style={styles.campos}>
        <View style={styles.campo}>
          <Text style={styles.label}>
            Fecha de medición *
          </Text>

          <TextInput
            style={styles.input}
            value={fecha}
            onChangeText={setFecha}
            placeholder="YYYY-MM-DD"
            editable={!guardando}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>
            Peso en kilogramos *
          </Text>

          <TextInput
            style={styles.input}
            value={peso}
            onChangeText={setPeso}
            keyboardType="decimal-pad"
            placeholder="Ej. 12.50"
            editable={!guardando}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>
            Talla en centímetros *
          </Text>

          <TextInput
            style={styles.input}
            value={talla}
            onChangeText={setTalla}
            keyboardType="decimal-pad"
            placeholder="Ej. 89.40"
            editable={!guardando}
          />
        </View>

        <View style={styles.campoCompleto}>
          <Text style={styles.label}>
            Observaciones
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
            ]}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={3}
            maxLength={1000}
            textAlignVertical="top"
            placeholder="Observaciones del control..."
            editable={!guardando}
          />
        </View>
      </View>

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.acciones}>
        <Pressable
          onPress={onCancel}
          disabled={guardando}
          style={styles.cancelar}
        >
          <Text style={styles.cancelarTexto}>
            Cancelar
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void guardar()}
          disabled={guardando}
          style={[
            styles.guardar,
            guardando && styles.deshabilitado,
          ]}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.guardarTexto}>
              {registro
                ? 'Guardar cambios'
                : 'Registrar control'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },

  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14213D',
  },

  descripcion: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },

  campos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },

  campo: {
    flexGrow: 1,
    flexBasis: 200,
    minWidth: 180,
    gap: 6,
  },

  campoCompleto: {
    width: '100%',
    gap: 6,
  },

  label: {
    color: '#14213D',
    fontSize: 12,
    fontWeight: '600',
  },

  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: '#14213D',
    fontSize: 14,
  },

  textarea: {
    minHeight: 90,
    paddingVertical: 10,
  },

  error: {
    color: '#DC2626',
    fontSize: 12,
    lineHeight: 19,
  },

  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },

  cancelar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },

  cancelarTexto: {
    color: '#475569',
    fontWeight: '600',
  },

  guardar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1768D8',
    minWidth: 145,
    alignItems: 'center',
  },

  guardarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  deshabilitado: {
    opacity: 0.6,
  },
});