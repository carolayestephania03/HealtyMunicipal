import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import { comunidadesService } from '../services/comunidades.service';
import type { CentroSalud, Comunidad, ComunidadCrearDto } from '../types';

type Props = {
  comunidad?: Comunidad | null;
  centros: CentroSalud[];
  cargandoCentros: boolean;
  errorCentros: string | null;
  onCancel: () => void;
  onSaved: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad';
};

function Campo({ label, value, onChangeText, placeholder, maxLength, keyboardType = 'default' }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8390A5"
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function opcionTexto(centro: CentroSalud) {
  return `${centro.codigo} · ${centro.nombre}${centro.activo === false ? ' (inactivo)' : ''}`;
}

export function ComunidadForm({ comunidad, centros, cargandoCentros, errorCentros, onCancel, onSaved }: Props) {
  const editar = comunidad !== undefined && comunidad !== null;
  const [idCentro, setIdCentro] = useState(String(comunidad?.id_centro ?? ''));
  const [centrosAbiertos, setCentrosAbiertos] = useState(false);
  const [nombre, setNombre] = useState(comunidad?.nombre ?? '');
  const [ubicacion, setUbicacion] = useState(comunidad?.ubicacion ?? '');
  const [municipio, setMunicipio] = useState(comunidad?.municipio ?? '');
  const [departamento, setDepartamento] = useState(comunidad?.departamento ?? '');
  const [familiasEstimadas, setFamiliasEstimadas] = useState(
    comunidad?.numero_familias_estimadas == null ? '' : String(comunidad.numero_familias_estimadas)
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIdCentro(String(comunidad?.id_centro ?? ''));
    setNombre(comunidad?.nombre ?? '');
    setUbicacion(comunidad?.ubicacion ?? '');
    setMunicipio(comunidad?.municipio ?? '');
    setDepartamento(comunidad?.departamento ?? '');
    setFamiliasEstimadas(
      comunidad?.numero_familias_estimadas == null ? '' : String(comunidad.numero_familias_estimadas)
    );
    setError(null);
  }, [comunidad]);

  useEffect(() => {
    if (!editar && centros.length === 1 && idCentro === '') {
      setIdCentro(String(centros[0].id_centro));
    }
  }, [centros, editar, idCentro]);

  const centrosElegibles = useMemo(
    () => centros.filter((centro) => centro.activo !== false || String(centro.id_centro) === idCentro),
    [centros, idCentro]
  );

  const centroSeleccionado = centros.find((c) => String(c.id_centro) === idCentro);
  const bloqueado = guardando || cargandoCentros || !!errorCentros || centros.length === 0;

  const guardar = async () => {
    if (bloqueado) return;
    setError(null);

    const centro = Number(idCentro);
    if (!Number.isSafeInteger(centro) || centro <= 0 || !centroSeleccionado) {
      setError('Seleccione un centro de salud disponible.');
      return;
    }
    if (centroSeleccionado.activo === false && String(comunidad?.id_centro ?? '') !== idCentro) {
      setError('No puede asignar la comunidad a un centro inactivo.');
      return;
    }

    const nombreFinal = nombre.trim();
    if (nombreFinal.length < 2 || nombreFinal.length > 150) {
      setError('El nombre debe contener entre 2 y 150 caracteres.');
      return;
    }
    if (ubicacion.trim().length > 255 || municipio.trim().length > 100 || departamento.trim().length > 100) {
      setError('Revise los límites de ubicación (255), municipio (100) y departamento (100).');
      return;
    }

    let estimadas: number | null = null;
    if (familiasEstimadas.trim() !== '') {
      estimadas = Number(familiasEstimadas.trim());
      if (!Number.isSafeInteger(estimadas) || estimadas < 0) {
        setError('El número de familias estimadas debe ser un entero mayor o igual a cero.');
        return;
      }
    }

    const datos: ComunidadCrearDto = {
      id_centro: centro,
      nombre: nombreFinal,
      ubicacion: ubicacion.trim() || null,
      municipio: municipio.trim() || null,
      departamento: departamento.trim() || null,
      numero_familias_estimadas: estimadas,
    };

    setGuardando(true);
    try {
      const respuesta = editar && comunidad
        ? await comunidadesService.actualizar(comunidad.id_comunidad, datos)
        : await comunidadesService.crear(datos);
      if (!respuesta.success || !respuesta.data) {
        throw new Error(respuesta.message || 'La API no confirmó el guardado.');
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible guardar la comunidad.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{editar ? 'Editar comunidad' : 'Registrar comunidad'}</Text>
      <Text style={styles.description}>Complete los datos administrativos. Los campos marcados con * son obligatorios.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Centro de salud *</Text>
        <Pressable
          accessibilityRole="button"
          disabled={bloqueado}
          onPress={() => setCentrosAbiertos((actual) => !actual)}
          style={styles.select}
        >
          <Text style={[styles.selectText, !idCentro && { color: colors.muted }]} numberOfLines={2}>
            {centroSeleccionado ? opcionTexto(centroSeleccionado) : 'Seleccione un centro de salud'}
          </Text>
          <Ionicons name={centrosAbiertos ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color={colors.primary} />
        </Pressable>
        {centrosAbiertos && !bloqueado && (
          <View style={styles.options}>
            {centrosElegibles.map((centro) => {
              const seleccionado = String(centro.id_centro) === idCentro;
              return (
                <Pressable
                  key={String(centro.id_centro)}
                  onPress={() => { setIdCentro(String(centro.id_centro)); setCentrosAbiertos(false); }}
                  style={[styles.option, seleccionado && { backgroundColor: colors.infoLight }]}
                >
                  <Text style={styles.optionText}>{opcionTexto(centro)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {cargandoCentros && <ActivityIndicator color={colors.primary} />}
        {errorCentros && <Text style={styles.error}>Centros de salud: {errorCentros}</Text>}
        {!cargandoCentros && !errorCentros && centros.length === 0 && (
          <Text style={styles.error}>No hay centros de salud disponibles para asociar a la comunidad.</Text>
        )}
      </View>
      <View style={styles.row}>
        <View style={styles.rowField}><Campo label="Nombre de la comunidad *" value={nombre} onChangeText={setNombre} maxLength={150} placeholder="Ej. Aldea El Progreso" /></View>
        <View style={styles.rowField}><Campo label="Municipio" value={municipio} onChangeText={setMunicipio} maxLength={100} placeholder="Municipio" /></View>
        <View style={styles.rowField}><Campo label="Departamento" value={departamento} onChangeText={setDepartamento} maxLength={100} placeholder="Departamento" /></View>
        <View style={styles.rowField}><Campo label="Familias estimadas" value={familiasEstimadas} onChangeText={setFamiliasEstimadas} keyboardType="number-pad" placeholder="Ej. 120" /></View>
      </View>
      <Campo label="Ubicación / referencia" value={ubicacion} onChangeText={setUbicacion} maxLength={255} placeholder="Localización de la comunidad" />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <Pressable disabled={guardando} onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Cancelar</Text>
        </Pressable>
        <Pressable disabled={bloqueado} onPress={() => void guardar()} style={[styles.primaryButton, bloqueado && { opacity: .45 }]}>
          {guardando ? <ActivityIndicator color="#FFFFFF" /> : (
            <Text style={styles.primaryText}>{editar ? 'Guardar cambios' : 'Registrar comunidad'}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, gap: 17 },
  title: { fontSize: 19, color: colors.text, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  rowField: { flexGrow: 1, flexBasis: 230, minWidth: 220 },
  field: { width: '100%', minWidth: 0, gap: 6 },
  label: { fontSize: 12, color: colors.text, fontWeight: '700' },
  input: { minHeight: 46, backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, color: colors.text, fontSize: 14 },
  select: { minHeight: 46, borderColor: colors.border, borderWidth: 1, borderRadius: 9, padding: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  selectText: { color: colors.text, fontSize: 13, flex: 1 },
  options: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' },
  option: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { color: colors.text, fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10 },
  primaryButton: { borderRadius: 9, minHeight: 44, backgroundColor: colors.primary, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, minHeight: 44, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: colors.text, fontWeight: '700' },
  error: { fontSize: 12, color: colors.danger, lineHeight: 20 },
});
