import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { colors } from '../../../constants/theme';
import { useResponsive } from '../../../hooks/use-responsive';
import { comunidadesService } from '../services/comunidades.service';
import { centrosSaludService } from '../services/centros-salud.service';
import { ComunidadForm } from './comunidad-form';
import { ComunidadDetalle } from './comunidad-detalle';
import type { CentroSalud, Comunidad, Id } from '../types';

type Vista = 'listado' | 'crear' | 'editar' | 'detalle';
type Estado = 'TODOS' | 'ACTIVAS' | 'INACTIVAS';
const PAGE_SIZE = 7;

function normalizar(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function Metrica({ label, value, icon, tint, isMobile }: {
  label: string;
  value: number | string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  isMobile: boolean;
}) {
  return (
    <View style={[styles.metric, { width: isMobile ? '100%' : '48%' }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${tint}17` }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <View style={{ gap: 5, flex: 1 }}>
        <Text style={styles.metricNumber}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

function Accion({ icon, onPress, label }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.tableAction}>
      <Ionicons name={icon} color={colors.primary} size={19} />
    </Pressable>
  );
}

export default function ComunidadesScreen() {
  const { isMobile, width } = useResponsive();
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCentros, setCargandoCentros] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCentros, setErrorCentros] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [vista, setVista] = useState<Vista>('listado');
  const [seleccionada, setSeleccionada] = useState<Comunidad | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<Estado>('TODOS');
  const [centroFiltro, setCentroFiltro] = useState<string>('TODOS');
  const [mostrarCentrosFiltro, setMostrarCentrosFiltro] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [confirmacion, setConfirmacion] = useState<Comunidad | null>(null);
  const [cambiando, setCambiando] = useState(false);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    const consultar = async () => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await comunidadesService.listar(abort.signal);
        if (abort.signal.aborted) return;
        if (!respuesta.success || !Array.isArray(respuesta.data)) {
          throw new Error('La API no devolvió un listado de comunidades válido.');
        }
        setComunidades(respuesta.data);
      } catch (e) {
        if (abort.signal.aborted) return;
        setComunidades([]);
        setError(e instanceof Error ? e.message : 'No se pudieron consultar las comunidades.');
      } finally {
        if (!abort.signal.aborted) setCargando(false);
      }
    };
    void consultar();
    return () => abort.abort();
  }, [revision]);

  useEffect(() => {
    const abort = new AbortController();
    const consultar = async () => {
      setCargandoCentros(true);
      setErrorCentros(null);
      try {
        const respuesta = await centrosSaludService.listar(abort.signal);
        if (abort.signal.aborted) return;
        if (!respuesta.success || !Array.isArray(respuesta.data)) {
          throw new Error('Formato de respuesta de centros de salud no válido.');
        }
        setCentros(respuesta.data);
      } catch (e) {
        if (abort.signal.aborted) return;
        setErrorCentros(e instanceof Error ? e.message : 'No se pudieron cargar los centros de salud.');
      } finally {
        if (!abort.signal.aborted) setCargandoCentros(false);
      }
    };
    void consultar();
    return () => abort.abort();
  }, []);

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return comunidades.filter((comunidad) => {
      const texto = normalizar([
        comunidad.nombre, comunidad.municipio || '', comunidad.departamento || '',
        comunidad.ubicacion || '', comunidad.centroSalud?.nombre || '', comunidad.centroSalud?.codigo || '',
      ].join(' '));
      return (!q || texto.includes(q)) &&
        (estado === 'TODOS' || (estado === 'ACTIVAS' ? comunidad.activo : !comunidad.activo)) &&
        (centroFiltro === 'TODOS' || String(comunidad.id_centro) === centroFiltro);
    });
  }, [comunidades, busqueda, estado, centroFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE);
  const activas = comunidades.filter((c) => c.activo).length;
  const inactivas = comunidades.length - activas;
  const familiasEstimadas = comunidades.reduce((suma, c) => {
    const valor = Number(c.numero_familias_estimadas);
    return suma + (c.numero_familias_estimadas != null && Number.isFinite(valor) && valor >= 0 ? valor : 0);
  }, 0);

  const actualizar = () => { setRevision((actual) => actual + 1); };
  const volver = () => { setVista('listado'); setSeleccionada(null); actualizar(); };
  const ver = (comunidad: Comunidad) => { setSeleccionada(comunidad); setVista('detalle'); };
  const editar = (comunidad: Comunidad) => { setSeleccionada(comunidad); setVista('editar'); };

  const cambiarEstado = async () => {
    if (!confirmacion || cambiando) return;
    setCambiando(true);
    setErrorEstado(null);
    try {
      const respuesta = await comunidadesService.cambiarEstado(confirmacion.id_comunidad, !confirmacion.activo);
      if (!respuesta.success) throw new Error(respuesta.message || 'No se pudo actualizar el estado.');
      setConfirmacion(null);
      actualizar();
    } catch (e) {
      setErrorEstado(e instanceof Error ? e.message : 'Error al modificar el estado.');
    } finally {
      setCambiando(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={vista === 'listado' ? 'Comunidades' : vista === 'crear' ? 'Registrar comunidad' : vista === 'editar' ? 'Editar comunidad' : 'Detalle de comunidad'}
        description="Administración de comunidades, centros de salud y familias asociadas."
      />
      {vista === 'listado' ? (
        <>
          <View style={styles.topRow}>
            <Text style={styles.subtitle}>Registro, consulta y mantenimiento de comunidades.</Text>
            <Pressable style={styles.primaryButton} onPress={() => { setSeleccionada(null); setVista('crear'); }}>
              <Ionicons name="add" size={21} color="#FFFFFF" />
              <Text style={styles.primaryText}>Nueva comunidad</Text>
            </Pressable>
          </View>
          <View style={styles.metrics}>
            <Metrica label="Comunidades registradas" value={cargando ? '—' : comunidades.length} icon="map-outline" tint={colors.primary} isMobile={isMobile} />
            <Metrica label="Comunidades activas" value={cargando ? '—' : activas} icon="checkmark-circle-outline" tint={colors.success} isMobile={isMobile} />
            <Metrica label="Comunidades inactivas" value={cargando ? '—' : inactivas} icon="alert-circle-outline" tint={colors.warning} isMobile={isMobile} />
            <Metrica label="Familias estimadas" value={cargando ? '—' : familiasEstimadas} icon="people-outline" tint="#7466C4" isMobile={isMobile} />
          </View>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeading}>
                <Ionicons name="list-outline" size={22} color={colors.primary} />
                <Text style={styles.panelTitle}>Listado de comunidades</Text>
              </View>
              <Pressable style={styles.outlineButton} onPress={actualizar} disabled={cargando}>
                <Ionicons name="refresh-outline" size={18} color={colors.primary} />
                <Text style={styles.outlineText}>Actualizar</Text>
              </Pressable>
            </View>
            <View style={styles.filters}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" color={colors.muted} size={20} />
                <TextInput
                  style={styles.searchInput}
                  value={busqueda}
                  onChangeText={(v) => { setBusqueda(v); setPagina(1); }}
                  placeholder="Buscar comunidad, municipio o centro de salud..."
                  placeholderTextColor="#8290A4"
                />
                {!!busqueda && (
                  <Pressable onPress={() => { setBusqueda(''); setPagina(1); }}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.muted} />
                  </Pressable>
                )}
              </View>
              <View style={styles.filterGroup}>
                {(['TODOS', 'ACTIVAS', 'INACTIVAS'] as Estado[]).map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => { setEstado(value); setPagina(1); }}
                    style={[styles.chip, estado === value && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, estado === value && styles.chipActiveText]}>
                      {value === 'TODOS' ? 'Todos' : value === 'ACTIVAS' ? 'Activas' : 'Inactivas'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.centerPicker}>
              <Text style={styles.centerLabel}>Centro de salud:</Text>
              <Pressable onPress={() => setMostrarCentrosFiltro((x) => !x)} style={styles.centerButton}>
                <Text style={styles.centerText}>
                  {centroFiltro === 'TODOS' ? 'Todos los centros' :
                    centros.find((c) => String(c.id_centro) === centroFiltro)?.nombre ?? 'Centro seleccionado'}
                </Text>
                <Ionicons name={mostrarCentrosFiltro ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
              </Pressable>
            </View>
            {mostrarCentrosFiltro && (
              <View style={styles.centerChoices}>
                <Pressable style={styles.centerChoice} onPress={() => { setCentroFiltro('TODOS'); setPagina(1); setMostrarCentrosFiltro(false); }}>
                  <Text style={styles.choiceText}>Todos los centros</Text>
                </Pressable>
                {centros.map((centro) => (
                  <Pressable key={String(centro.id_centro)} style={styles.centerChoice} onPress={() => { setCentroFiltro(String(centro.id_centro)); setPagina(1); setMostrarCentrosFiltro(false); }}>
                    <Text style={styles.choiceText}>{centro.codigo} · {centro.nombre}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {errorCentros && <Text style={styles.note}>No se pudo consultar el catálogo de centros: {errorCentros}. El listado general de comunidades continúa disponible.</Text>}
            {cargando ? (
              <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.secondary}>Consultando comunidades...</Text></View>
            ) : error ? (
              <View style={styles.loading}><Text style={styles.error}>{error}</Text><Pressable onPress={actualizar} style={styles.outlineButton}><Text style={styles.outlineText}>Reintentar</Text></Pressable></View>
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View style={{ minWidth: Math.max(980, width - (isMobile ? 80 : 380)) }}>
                    <View style={[styles.tr, styles.trHeader]}>
                      <Text style={[styles.th, { flex: 2.2 }]}>Comunidad</Text>
                      <Text style={[styles.th, { flex: 2 }]}>Centro de salud</Text>
                      <Text style={[styles.th, { flex: 1.3 }]}>Municipio</Text>
                      <Text style={[styles.th, { flex: 1.2 }]}>Familias est.</Text>
                      <Text style={[styles.th, { flex: 1.1 }]}>Estado</Text>
                      <Text style={[styles.th, { width: 142 }]}>Acciones</Text>
                    </View>
                    {visibles.length === 0 ? (
                      <Text style={styles.empty}>No se encontraron comunidades con los filtros seleccionados.</Text>
                    ) : visibles.map((c, index) => (
                      <View key={String(c.id_comunidad)} style={[styles.tr, index % 2 === 1 && { backgroundColor: '#FBFDFF' }]}>
                        <Text style={[styles.td, styles.strong, { flex: 2.2 }]} numberOfLines={2}>{c.nombre}</Text>
                        <Text style={[styles.td, { flex: 2 }]} numberOfLines={2}>{c.centroSalud?.nombre ?? String(c.id_centro)}</Text>
                        <Text style={[styles.td, { flex: 1.3 }]} numberOfLines={2}>{c.municipio || '—'}</Text>
                        <Text style={[styles.td, { flex: 1.2 }]}>{c.numero_familias_estimadas ?? '—'}</Text>
                        <View style={{ flex: 1.1, justifyContent: 'center' }}>
                          <View style={[styles.status, { backgroundColor: c.activo ? colors.successLight : colors.dangerLight }]}>
                            <Text style={{ color: c.activo ? colors.success : colors.danger, fontWeight: '700', fontSize: 12 }}>{c.activo ? 'Activa' : 'Inactiva'}</Text>
                          </View>
                        </View>
                        <View style={styles.actions}>
                          <Accion label="Visualizar comunidad" icon="eye-outline" onPress={() => ver(c)} />
                          <Accion label="Editar comunidad" icon="create-outline" onPress={() => editar(c)} />
                          <Accion label={c.activo ? 'Desactivar comunidad' : 'Activar comunidad'} icon={c.activo ? 'pause-circle-outline' : 'play-circle-outline'} onPress={() => { setConfirmacion(c); setErrorEstado(null); }} />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <View style={styles.pagination}>
                  <Text style={styles.secondary}>Mostrando {filtradas.length ? (paginaSegura - 1) * PAGE_SIZE + 1 : 0}–{Math.min(paginaSegura * PAGE_SIZE, filtradas.length)} de {filtradas.length}</Text>
                  <View style={styles.pageActions}>
                    <Pressable disabled={paginaSegura <= 1} onPress={() => setPagina((p) => p - 1)} style={[styles.pageButton, paginaSegura <= 1 && styles.pageDisabled]}>
                      <Ionicons name="chevron-back" size={18} color={colors.primary} />
                    </Pressable>
                    <Text style={styles.pageLabel}>Página {paginaSegura} de {totalPaginas}</Text>
                    <Pressable disabled={paginaSegura >= totalPaginas} onPress={() => setPagina((p) => p + 1)} style={[styles.pageButton, paginaSegura >= totalPaginas && styles.pageDisabled]}>
                      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
          {confirmacion && (
            <View style={styles.confirm}>
              <Text style={styles.panelTitle}>{confirmacion.activo ? 'Desactivar comunidad' : 'Activar comunidad'}</Text>
              <Text style={styles.secondary}>
                ¿Confirma que desea {confirmacion.activo ? 'desactivar' : 'activar'} «{confirmacion.nombre}»? No se eliminarán registros de familias ni niños asociados.
              </Text>
              {errorEstado && <Text style={styles.error}>{errorEstado}</Text>}
              <View style={styles.confirmActions}>
                <Pressable style={styles.outlineButton} onPress={() => setConfirmacion(null)} disabled={cambiando}><Text style={styles.outlineText}>Cancelar</Text></Pressable>
                <Pressable style={styles.primaryButton} onPress={() => void cambiarEstado()} disabled={cambiando}>
                  <Text style={styles.primaryText}>{cambiando ? 'Procesando...' : 'Confirmar'}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      ) : vista === 'detalle' && seleccionada ? (
        <ComunidadDetalle idComunidad={seleccionada.id_comunidad} onBack={volver} onEdit={editar} />
      ) : (
        <>
          <Pressable onPress={volver} style={styles.back}>
            <Ionicons name="arrow-back-outline" color={colors.primary} size={18} />
            <Text style={styles.outlineText}>Volver al listado</Text>
          </Pressable>
          <ComunidadForm
            key={vista === 'editar' ? `editar-${seleccionada?.id_comunidad}` : 'crear'}
            comunidad={vista === 'editar' ? seleccionada : null}
            centros={centros}
            cargandoCentros={cargandoCentros}
            errorCentros={errorCentros}
            onCancel={volver}
            onSaved={volver}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  subtitle: { color: colors.muted, fontSize: 13, flex: 1, minWidth: 180 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 9, minHeight: 43, paddingHorizontal: 16, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  metric: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 18, minHeight: 110, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 14 },
  metricIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27 },
  metricNumber: { fontSize: 27, fontWeight: '800', color: colors.text },
  metricLabel: { fontSize: 13, color: colors.muted },
  panel: { borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, padding: 18, gap: 15 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  panelHeading: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  panelTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  outlineButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 9, minHeight: 39, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  outlineText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  searchBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, flex: 2, minWidth: 240 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, minWidth: 0 },
  filterGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
  chipActive: { backgroundColor: colors.infoLight, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  chipActiveText: { color: colors.primary },
  centerPicker: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  centerLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  centerButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 10 },
  centerText: { color: colors.text, fontSize: 12 },
  centerChoices: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, overflow: 'hidden' },
  centerChoice: { borderBottomWidth: 1, borderBottomColor: colors.border, padding: 12 },
  choiceText: { fontSize: 13, color: colors.text },
  note: { fontSize: 12, color: colors.warning },
  loading: { alignItems: 'center', padding: 28, gap: 10 },
  error: { fontSize: 13, color: colors.danger },
  secondary: { fontSize: 12, color: colors.muted, lineHeight: 20 },
  tr: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 12, paddingVertical: 12, minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 9 },
  trHeader: { backgroundColor: '#F1F5FA', minHeight: 49, borderTopLeftRadius: 9, borderTopRightRadius: 9 },
  th: { color: colors.text, fontSize: 12, fontWeight: '800' },
  td: { color: colors.text, fontSize: 12 },
  strong: { fontWeight: '700' },
  status: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 13, alignSelf: 'flex-start' },
  actions: { width: 142, flexDirection: 'row', gap: 6, justifyContent: 'flex-start' },
  tableAction: { width: 40, height: 38, borderRadius: 9, backgroundColor: colors.infoLight, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.muted, textAlign: 'center', padding: 24, fontSize: 13 },
  pagination: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 8 },
  pageActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageButton: { width: 38, height: 38, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pageDisabled: { opacity: .35 },
  pageLabel: { fontSize: 12, color: colors.text, fontWeight: '700' },
  confirm: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning, borderRadius: 12, padding: 18, gap: 12 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' },
});
