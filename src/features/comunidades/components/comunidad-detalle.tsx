import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import { comunidadesService } from '../services/comunidades.service';
import { comunidadRelacionesService } from '../services/centros-salud.service';
import type { Comunidad, FamiliaComunidad, Id, NinoFamilia } from '../types';

type Props = { idComunidad: Id; onBack: () => void; onEdit: (comunidad: Comunidad) => void };

function TextoInfo({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{value === null || value === undefined || value === '' ? 'No disponible' : String(value)}</Text>
    </View>
  );
}

export function ComunidadDetalle({ idComunidad, onBack, onEdit }: Props) {
  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const [familias, setFamilias] = useState<FamiliaComunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizacion, setActualizacion] = useState(0);
  const [familiaAbierta, setFamiliaAbierta] = useState<string | null>(null);
  const [ninos, setNinos] = useState<NinoFamilia[]>([]);
  const [cargandoNinos, setCargandoNinos] = useState(false);
  const [errorNinos, setErrorNinos] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    setError(null);
    setFamiliaAbierta(null);
    setNinos([]);
    const cargar = async () => {
      try {
        const [respuestaComunidad, respuestaFamilias] = await Promise.all([
          comunidadesService.obtenerPorId(idComunidad),
          comunidadRelacionesService.familias(idComunidad),
        ]);
        if (!activo) return;
        if (!respuestaComunidad.success || !respuestaComunidad.data ||
            !respuestaFamilias.success || !Array.isArray(respuestaFamilias.data)) {
          throw new Error('La API no devolvió datos válidos para la comunidad.');
        }
        setComunidad(respuestaComunidad.data);
        setFamilias(respuestaFamilias.data);
      } catch (e) {
        if (!activo) return;
        setError(e instanceof Error ? e.message : 'Error al consultar la comunidad.');
      } finally {
        if (activo) setLoading(false);
      }
    };
    void cargar();
    return () => { activo = false; };
  }, [idComunidad, actualizacion]);

  const abrirFamilia = async (familia: FamiliaComunidad) => {
    const id = String(familia.id_familia);
    if (familiaAbierta === id) {
      setFamiliaAbierta(null);
      setNinos([]);
      return;
    }
    setFamiliaAbierta(id);
    setNinos([]);
    setErrorNinos(null);
    setCargandoNinos(true);
    try {
      const respuesta = await comunidadRelacionesService.ninosDeFamilia(id);
      if (!respuesta.success || !Array.isArray(respuesta.data)) {
        throw new Error(respuesta.message || 'No fue posible consultar los niños.');
      }
      setNinos(respuesta.data);
    } catch (e) {
      setErrorNinos(e instanceof Error ? e.message : 'Error al consultar niños de la familia.');
    } finally {
      setCargandoNinos(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.outlineButton}>
          <Ionicons name="arrow-back-outline" color={colors.primary} size={17} />
          <Text style={styles.outlineText}>Volver al listado</Text>
        </Pressable>
        {comunidad && (
          <Pressable onPress={() => onEdit(comunidad)} style={styles.blueButton}>
            <Ionicons name="create-outline" color="#FFFFFF" size={17} />
            <Text style={styles.blueText}>Editar comunidad</Text>
          </Pressable>
        )}
      </View>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : error ? (
        <View style={styles.card}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => setActualizacion((x) => x + 1)} style={styles.outlineButton}>
            <Text style={styles.outlineText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : comunidad ? (
        <>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{comunidad.nombre}</Text>
              <View style={[styles.badge, { backgroundColor: comunidad.activo ? colors.successLight : colors.dangerLight }]}>
                <Text style={{ color: comunidad.activo ? colors.success : colors.danger, fontWeight: '700' }}>
                  {comunidad.activo ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            <View style={styles.grid}>
              <TextoInfo label="Centro de salud" value={comunidad.centroSalud?.nombre ?? comunidad.id_centro} />
              <TextoInfo label="Código del centro" value={comunidad.centroSalud?.codigo} />
              <TextoInfo label="Municipio" value={comunidad.municipio} />
              <TextoInfo label="Departamento" value={comunidad.departamento} />
              <TextoInfo label="Ubicación" value={comunidad.ubicacion} />
              <TextoInfo label="Familias estimadas" value={comunidad.numero_familias_estimadas} />
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Familias vinculadas ({familias.length})</Text>
            <Text style={styles.helper}>Seleccione una familia para consultar los niños asociados.</Text>
            {familias.length === 0 ? (
              <Text style={styles.helper}>Todavía no hay familias registradas en esta comunidad.</Text>
            ) : familias.map((familia) => (
              <View key={String(familia.id_familia)} style={styles.familyBox}>
                <Pressable style={styles.familyRow} onPress={() => void abrirFamilia(familia)}>
                  <Ionicons name="people-outline" color={colors.primary} size={20} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.familyTitle}>{familia.codigo_familia}</Text>
                    <Text style={styles.helper} numberOfLines={1}>{familia.direccion || 'Sin dirección registrada'}</Text>
                  </View>
                  <Ionicons name={familiaAbierta === String(familia.id_familia) ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </Pressable>
                {familiaAbierta === String(familia.id_familia) && (
                  <View style={styles.children}>
                    {cargandoNinos ? <ActivityIndicator color={colors.primary} /> : errorNinos ? (
                      <Text style={styles.error}>{errorNinos}</Text>
                    ) : ninos.length === 0 ? (
                      <Text style={styles.helper}>Esta familia no tiene niños registrados.</Text>
                    ) : ninos.map((nino) => (
                      <View key={String(nino.id_nino)} style={styles.childRow}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.familyTitle}>{nino.nombres} {nino.apellidos}</Text>
                          <Text style={styles.helper}>Expediente: {nino.codigo_expediente}</Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => router.push({ pathname: '/ninos/[id]', params: { id: String(nino.id_nino) } })}
                          style={styles.outlineButton}
                        >
                          <Ionicons name="eye-outline" size={16} color={colors.primary} />
                          <Text style={styles.outlineText}>Expediente</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 16 },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  info: { flexGrow: 1, flexBasis: 220, minWidth: 180, gap: 5 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  valor: { color: colors.text, fontSize: 14, fontWeight: '600' },
  badge: { borderRadius: 14, paddingHorizontal: 11, paddingVertical: 7 },
  helper: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  familyBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, overflow: 'hidden' },
  familyRow: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12 },
  familyTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  children: { backgroundColor: colors.canvas, padding: 12, gap: 10 },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  outlineButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 9, paddingHorizontal: 12, minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' },
  outlineText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  blueButton: { borderRadius: 9, paddingHorizontal: 14, minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary },
  blueText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
