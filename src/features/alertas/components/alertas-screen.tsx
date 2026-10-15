import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { colors } from '../../../constants/theme';
import { alertasService } from '../services/alertas.service';
import type {
  Alerta, EstadoAlerta, FiltroEstado, FiltroPeriodo, GrupoAlerta,
} from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const TAMANIO_PAGINA = 8;

const TIPOS: Record<string, string> = {
  BAJO_PESO: 'Bajo peso',
  SOBREPESO: 'Sobrepeso',
  TALLA_BAJA: 'Talla baja',
  VACUNA_ATRASADA: 'Vacunación atrasada',
  SIN_CONTROL_RECIENTE: 'Sin control reciente',
  VACUNA_PENDIENTE: 'Vacuna pendiente',
  CRECIMIENTO_FUERA_RANGO: 'Crecimiento fuera de rango',
};

const textoTipo = (tipo: string) =>
  TIPOS[tipo] ?? tipo.replace(/_/g, ' ').toLowerCase().replace(/^\p{L}/u, c => c.toUpperCase());

const textoEstado = (estado: string) => {
  if (estado === 'PENDIENTE') return 'Pendiente';
  if (estado === 'ATENDIDA') return 'Atendida';
  if (estado === 'DESCARTADA') return 'Descartada';
  return estado || 'Sin estado';
};

const fechaLegible = (iso?: string | null) => {
  if (!iso) return 'No registrada';
  const fecha = new Date(iso);
  if (!Number.isFinite(fecha.getTime())) return 'No registrada';
  return fecha.toLocaleDateString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const fechaOrden = (alerta: Alerta): number => {
  const valor = alerta.fecha_generacion ? Date.parse(alerta.fecha_generacion) : NaN;
  return Number.isFinite(valor) ? valor : 0;
};

const nombreNino = (alerta: Alerta): string => {
  const nombre = [alerta.nino?.nombres, alerta.nino?.apellidos].filter(Boolean).join(' ').trim();
  return nombre || (alerta.id_nino != null ? `Niño #${alerta.id_nino}` : 'Niño no disponible');
};

const pertenecePeriodo = (alerta: Alerta, periodo: FiltroPeriodo): boolean => {
  if (periodo === 'TODOS') return true;
  const fecha = fechaOrden(alerta);
  if (!fecha) return false;
  const hoy = Date.now();
  const desde = hoy - Number(periodo) * 24 * 60 * 60 * 1000;
  return fecha >= desde && fecha <= hoy;
};

function Boton({
  texto, icono, onPress, primario = false, deshabilitado = false,
}: {
  texto: string;
  icono?: IconName;
  onPress: () => void;
  primario?: boolean;
  deshabilitado?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [styles.boton, primario && styles.botonPrimario, (pressed || deshabilitado) && { opacity: 0.55 }]}
    >
      {icono ? <Ionicons name={icono} size={16} color={primario ? '#FFFFFF' : colors.primary} /> : null}
      <Text style={[styles.botonTexto, primario && styles.botonTextoPrimario]}>{texto}</Text>
    </Pressable>
  );
}

function Filtro({
  texto, activo, onPress,
}: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[styles.filtro, activo && styles.filtroActivo]}
    >
      <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

function PastillaEstado({ estado }: { estado: string }) {
  const estilo = estado === 'ATENDIDA'
    ? styles.estadoAtendido
    : estado === 'DESCARTADA' ? styles.estadoDescartado : styles.estadoPendiente;
  return (
    <View style={[styles.pastilla, estilo]}>
      <Text style={styles.pastillaTexto}>{textoEstado(estado)}</Text>
    </View>
  );
}

function Severidad({ severidad }: { severidad: string }) {
  const critica = severidad === 'CRITICA';
  return (
    <View style={[styles.pastilla, critica ? styles.severidadCritica : styles.severidadPreventiva]}>
      <Ionicons name={critica ? 'alert-circle-outline' : 'shield-checkmark-outline'} size={13} color={critica ? colors.danger : colors.warning} />
      <Text style={[styles.pastillaTexto, { color: critica ? colors.danger : colors.warning }]}>
        {critica ? 'Crítica' : severidad === 'PREVENTIVA' ? 'Preventiva' : severidad}
      </Text>
    </View>
  );
}

function TarjetaResumen({
  texto, cantidad, icono, color, fondo, onPress, activa,
}: {
  texto: string; cantidad: number; icono: IconName; color: string; fondo: string;
  onPress?: () => void; activa?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${texto}: ${cantidad}`}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.tarjeta, activa && { borderColor: color, borderWidth: 2 }]}
    >
      <View style={[styles.iconoResumen, { backgroundColor: fondo }]}>
        <Ionicons name={icono} size={22} color={color} />
      </View>
      <Text style={styles.cantidad}>{cantidad}</Text>
      <Text style={styles.etiquetaResumen}>{texto}</Text>
    </Pressable>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string | number | null | undefined }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiquetaDato}>{titulo}</Text>
      <Text style={styles.valorDato}>{valor == null || valor === '' ? 'No disponible' : String(valor)}</Text>
    </View>
  );
}

function DetalleAlerta({ alerta, volver }: { alerta: Alerta; volver: () => void }) {
  return (
    <View style={styles.panel}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoTitulo}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          <Text style={styles.tituloPanel}>Detalle de alerta #{alerta.id_alerta}</Text>
        </View>
        <Boton texto="Volver al listado" icono="arrow-back-outline" onPress={volver} />
      </View>
      <View style={styles.severidades}>
        <Severidad severidad={alerta.severidad} />
        <PastillaEstado estado={alerta.estado} />
      </View>
      <Text style={styles.tituloAlerta}>{alerta.titulo}</Text>
      <Text style={styles.ayuda}>{alerta.mensaje || 'No se registró una descripción adicional.'}</Text>
      <View style={styles.datosGrid}>
        <Dato titulo="Tipo de alerta" valor={textoTipo(alerta.tipo_alerta)} />
        <Dato titulo="Niño" valor={nombreNino(alerta)} />
        <Dato titulo="Expediente" valor={alerta.nino?.codigo_expediente} />
        <Dato titulo="Comunidad" valor={alerta.nino?.familia?.comunidad?.nombre} />
        <Dato titulo="Fecha de generación" valor={fechaLegible(alerta.fecha_generacion)} />
        <Dato titulo="Fecha de atención" valor={alerta.fecha_atencion ? fechaLegible(alerta.fecha_atencion) : 'Sin atención registrada'} />
        <Dato titulo="ID de registro de crecimiento" valor={alerta.id_registro_crecimiento} />
        <Dato titulo="ID de vacunación" valor={alerta.id_vacunacion_nino} />
      </View>
      {alerta.observacion_atencion ? (
        <View style={styles.observaciones}>
          <Text style={styles.subtitulo}>Observaciones de atención</Text>
          <Text style={styles.ayuda}>{alerta.observacion_atencion}</Text>
          {alerta.usuarioAtencion ? (
            <Text style={styles.textoPequeno}>
              Registrado por: {[alerta.usuarioAtencion.nombres, alerta.usuarioAtencion.apellidos].filter(Boolean).join(' ') || 'Personal de salud'}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.nota}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.textoNota}>Esta pantalla es únicamente de consulta. No genera notificaciones, no cambia estados y no reemplaza la valoración del personal de salud.</Text>
      </View>
    </View>
  );
}

export function AlertasScreen() {
  const { width } = useWindowDimensions();
  const compacto = width < 1024;
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grupo, setGrupo] = useState<GrupoAlerta>('CRITICA');
  const [estado, setEstado] = useState<FiltroEstado>('TODOS');
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('TODOS');
  const [tipo, setTipo] = useState('TODOS');
  const [texto, setTexto] = useState('');
  const [pagina, setPagina] = useState(1);
  const [seleccionada, setSeleccionada] = useState<Alerta | null>(null);

  const cargar = useCallback(async (recarga = false) => {
    if (recarga) setActualizando(true);
    else setCargando(true);
    setError(null);
    try {
      const registros = await alertasService.listar();
      setAlertas(registros.filter((a) => a && a.id_alerta != null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al consultar las alertas.');
      // No borrar la información previamente cargada durante una recarga fallida.
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const resumen = useMemo(() => ({
    total: alertas.length,
    criticas: alertas.filter(a => a.severidad === 'CRITICA').length,
    preventivas: alertas.filter(a => a.severidad === 'PREVENTIVA').length,
    pendientes: alertas.filter(a => a.estado === 'PENDIENTE').length,
  }), [alertas]);

  const tiposDisponibles = useMemo(() =>
    [...new Set(alertas.map(a => a.tipo_alerta).filter(Boolean))].sort(),
  [alertas]);

  const cambiarGrupo = (valor: GrupoAlerta) => {
    setGrupo(valor); setPagina(1); setSeleccionada(null);
  };

  const filtradas = useMemo(() => {
    const q = texto.trim().toLocaleLowerCase();
    return alertas
      .filter(a => grupo === 'TODAS' || a.severidad === grupo)
      .filter(a => estado === 'TODOS' || a.estado === estado)
      .filter(a => tipo === 'TODOS' || a.tipo_alerta === tipo)
      .filter(a => pertenecePeriodo(a, periodo))
      .filter(a => {
        if (!q) return true;
        const campos = [
          a.id_alerta, a.titulo, a.mensaje, textoTipo(a.tipo_alerta),
          nombreNino(a), a.nino?.codigo_expediente, a.nino?.familia?.comunidad?.nombre,
        ];
        return campos.some(c => String(c ?? '').toLocaleLowerCase().includes(q));
      })
      .sort((a, b) => fechaOrden(b) - fechaOrden(a));
  }, [alertas, grupo, estado, tipo, periodo, texto]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANIO_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginaActual = filtradas.slice((paginaSegura - 1) * TAMANIO_PAGINA, paginaSegura * TAMANIO_PAGINA);
  const totalGrupo = grupo === 'CRITICA' ? resumen.criticas : grupo === 'PREVENTIVA' ? resumen.preventivas : resumen.total;
  const tituloGrupo = grupo === 'CRITICA' ? 'Alertas críticas' : grupo === 'PREVENTIVA' ? 'Alertas preventivas' : 'Todas las alertas';

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Alertas"
        description="Consulta de alertas clínicas y de vacunación, clasificadas por severidad. Sin envío de mensajes."
      />

      <View style={styles.resumenGrid}>
        <TarjetaResumen texto="Alertas registradas" cantidad={resumen.total} icono="layers-outline" color={colors.primary} fondo={colors.infoLight} onPress={() => cambiarGrupo('TODAS')} activa={grupo === 'TODAS'} />
        <TarjetaResumen texto="Críticas" cantidad={resumen.criticas} icono="alert-circle-outline" color={colors.danger} fondo={colors.dangerLight} onPress={() => cambiarGrupo('CRITICA')} activa={grupo === 'CRITICA'} />
        <TarjetaResumen texto="Preventivas" cantidad={resumen.preventivas} icono="shield-checkmark-outline" color={colors.warning} fondo={colors.warningLight} onPress={() => cambiarGrupo('PREVENTIVA')} activa={grupo === 'PREVENTIVA'} />
      </View>

      <View style={styles.panel}>
        <View style={styles.encabezado}>
          <View style={styles.encabezadoTitulo}>
            <Ionicons name="filter-outline" size={20} color={colors.primary} />
            <Text style={styles.tituloPanel}>Consultar alertas</Text>
          </View>
          <Boton texto={actualizando ? 'Actualizando...' : 'Actualizar'} icono="refresh-outline" onPress={() => void cargar(true)} deshabilitado={cargando || actualizando} />
        </View>
        <View style={styles.tabs}>
          <Filtro texto={`Críticas (${resumen.criticas})`} activo={grupo === 'CRITICA'} onPress={() => cambiarGrupo('CRITICA')} />
          <Filtro texto={`Preventivas (${resumen.preventivas})`} activo={grupo === 'PREVENTIVA'} onPress={() => cambiarGrupo('PREVENTIVA')} />
          <Filtro texto={`Todas (${resumen.total})`} activo={grupo === 'TODAS'} onPress={() => cambiarGrupo('TODAS')} />
        </View>
        <TextInput
          accessibilityLabel="Buscar alerta"
          value={texto}
          onChangeText={v => { setTexto(v); setPagina(1); setSeleccionada(null); }}
          style={styles.entrada}
          placeholder="Buscar por alerta, expediente, nombre del niño o comunidad..."
          placeholderTextColor="#8A9AB0"
          autoCorrect={false}
        />
        <View style={styles.filtrosBloques}>
          <View style={styles.bloqueFiltro}>
            <Text style={styles.etiquetaDato}>Estado</Text>
            <View style={styles.tabs}>
              {(['TODOS', 'PENDIENTE', 'ATENDIDA', 'DESCARTADA'] as FiltroEstado[]).map(e => (
                <Filtro key={e} texto={e === 'TODOS' ? 'Todos' : textoEstado(e)} activo={estado === e} onPress={() => { setEstado(e); setPagina(1); setSeleccionada(null); }} />
              ))}
            </View>
          </View>
          <View style={styles.bloqueFiltro}>
            <Text style={styles.etiquetaDato}>Período de generación</Text>
            <View style={styles.tabs}>
              {([['TODOS','Todos'],['7','7 días'],['30','30 días'],['90','90 días']] as [FiltroPeriodo, string][]).map(([v, label]) => (
                <Filtro key={v} texto={label} activo={periodo === v} onPress={() => { setPeriodo(v); setPagina(1); setSeleccionada(null); }} />
              ))}
            </View>
          </View>
        </View>
        {tiposDisponibles.length ? (
          <View style={styles.bloqueFiltro}>
            <Text style={styles.etiquetaDato}>Tipo de alerta</Text>
            <View style={styles.tabs}>
              <Filtro texto="Todos" activo={tipo === 'TODOS'} onPress={() => {setTipo('TODOS');setPagina(1);setSeleccionada(null);}} />
              {tiposDisponibles.map(t => (
                <Filtro key={t} texto={textoTipo(t)} activo={tipo === t} onPress={() => {setTipo(t);setPagina(1);setSeleccionada(null);}} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorPanel}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorTexto}>{error}</Text>
          <Boton texto="Reintentar" onPress={() => void cargar()} icono="refresh-outline" />
        </View>
      ) : null}

      {cargando ? (
        <View style={styles.panelCentro}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.ayuda}>Cargando alertas desde PostgreSQL...</Text>
        </View>
      ) : seleccionada ? (
        <DetalleAlerta alerta={seleccionada} volver={() => setSeleccionada(null)} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.encabezado}>
            <View style={styles.encabezadoTitulo}>
              <Ionicons name={grupo === 'CRITICA' ? 'alert-circle-outline' : grupo === 'PREVENTIVA' ? 'shield-checkmark-outline' : 'list-outline'} size={21} color={grupo === 'CRITICA' ? colors.danger : colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tituloPanel}>{tituloGrupo}</Text>
                <Text style={styles.ayuda}>{filtradas.length} coincidencias · {totalGrupo} registros en esta categoría</Text>
              </View>
            </View>
          </View>
          {filtradas.length === 0 ? (
            <View style={styles.vacio}>
              <Ionicons name="search-outline" size={38} color={colors.muted} />
              <Text style={styles.subtitulo}>No se encontraron alertas</Text>
              <Text style={styles.ayuda}>Prueba con otro estado, período o término de búsqueda.</Text>
            </View>
          ) : compacto ? (
            <View style={styles.filasTarjetas}>
              {paginaActual.map(a => (
                <View key={String(a.id_alerta)} style={styles.tarjetaMovil}>
                  <View style={styles.tarjetaMovilEncabezado}>
                    <Text style={styles.nombreTarjeta}>{a.titulo}</Text>
                    <Severidad severidad={a.severidad} />
                  </View>
                  <Text style={styles.ayuda}>{nombreNino(a)} · {a.nino?.codigo_expediente || `#${a.id_nino ?? '—'}`}</Text>
                  <Text style={styles.textoPequeno}>{textoTipo(a.tipo_alerta)} · {fechaLegible(a.fecha_generacion)}</Text>
                  <View style={styles.filaMovilPie}>
                    <PastillaEstado estado={a.estado} />
                    <Boton texto="Ver detalle" icono="eye-outline" onPress={() => setSeleccionada(a)} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.tabla}>
              <View style={[styles.filaTabla, styles.encabezadoTabla]}>
                <Text style={[styles.tituloColumna, { flex: 2.5 }]}>Alerta / Tipo</Text>
                <Text style={[styles.tituloColumna, { flex: 2.0 }]}>Niño / Expediente</Text>
                <Text style={[styles.tituloColumna, { flex: 1.0 }]}>Severidad</Text>
                <Text style={[styles.tituloColumna, { flex: 1.0 }]}>Estado</Text>
                <Text style={[styles.tituloColumna, { flex: 1.0 }]}>Generada</Text>
                <Text style={[styles.tituloColumna, { flex: 0.9 }]}>Acción</Text>
              </View>
              {paginaActual.map(a => (
                <View style={styles.filaTabla} key={String(a.id_alerta)}>
                  <View style={{ flex: 2.5, gap: 4 }}>
                    <Text style={styles.nombreColumna} numberOfLines={2}>{a.titulo}</Text>
                    <Text style={styles.textoPequeno}>{textoTipo(a.tipo_alerta)}</Text>
                  </View>
                  <View style={{ flex: 2.0, gap: 4 }}>
                    <Text style={styles.nombreColumna} numberOfLines={2}>{nombreNino(a)}</Text>
                    <Text style={styles.textoPequeno}>{a.nino?.codigo_expediente || `#${a.id_nino ?? '—'}`}</Text>
                  </View>
                  <View style={{ flex: 1.0, alignItems: 'flex-start' }}><Severidad severidad={a.severidad} /></View>
                  <View style={{ flex: 1.0, alignItems: 'flex-start' }}><PastillaEstado estado={a.estado} /></View>
                  <Text style={[styles.fechaTabla, { flex: 1.0 }]}>{fechaLegible(a.fecha_generacion)}</Text>
                  <View style={{ flex: 0.9, alignItems: 'flex-start' }}>
                    <Boton texto="Ver" icono="eye-outline" onPress={() => setSeleccionada(a)} />
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={styles.paginacion}>
            <Text style={styles.ayuda}>{filtradas.length} registros · Página {paginaSegura} de {totalPaginas}</Text>
            <View style={styles.tabs}>
              <Boton texto="Anterior" icono="chevron-back-outline" deshabilitado={paginaSegura <= 1} onPress={() => setPagina(p => Math.max(1, p - 1))} />
              <Boton texto="Siguiente" icono="chevron-forward-outline" deshabilitado={paginaSegura >= totalPaginas} onPress={() => setPagina(p => Math.min(totalPaginas, p + 1))} />
            </View>
          </View>
        </View>
      )}
      <View style={styles.nota}>
        <Ionicons name="eye-outline" color={colors.primary} size={17} />
        <Text style={styles.textoNota}>Panel exclusivamente informativo. Las categorías se toman del campo severidad de la API. Aquí no se envían mensajes ni se modifican alertas.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  resumenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjeta: { minWidth: 170, flexGrow: 1, flexBasis: 210, padding: 18, borderRadius: 13, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, gap: 9 },
  iconoResumen: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cantidad: { fontSize: 27, fontWeight: '800', color: colors.text },
  etiquetaResumen: { color: colors.muted, fontSize: 12 },
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 20, gap: 16 },
  panelCentro: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 30, alignItems: 'center', justifyContent: 'center', gap: 10 },
  encabezado: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  encabezadoTitulo: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 220, gap: 8 },
  tituloPanel: { fontWeight: '800', color: colors.text, fontSize: 17 },
  subtitulo: { fontWeight: '700', color: colors.text, fontSize: 14 },
  ayuda: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  textoPequeno: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  boton: { flexDirection: 'row', gap: 6, borderRadius: 8, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 12, minHeight: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  botonPrimario: { backgroundColor: colors.primary, borderColor: colors.primary },
  botonTexto: { fontSize: 12, fontWeight: '700', color: colors.primary },
  botonTextoPrimario: { color: '#FFFFFF' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  filtro: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', borderRadius: 8, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  filtroActivo: { borderColor: colors.primary, backgroundColor: colors.infoLight },
  filtroTexto: { fontSize: 12, fontWeight: '600', color: colors.text },
  filtroTextoActivo: { color: colors.primary, fontWeight: '800' },
  entrada: { minHeight: 45, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 13, fontSize: 13, color: colors.text },
  filtrosBloques: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  bloqueFiltro: { gap: 8, flexGrow: 1 },
  etiquetaDato: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  severidades: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pastilla: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, alignSelf: 'flex-start', alignItems: 'center', flexDirection: 'row', gap: 5 },
  pastillaTexto: { fontWeight: '700', fontSize: 11, color: colors.text },
  severidadCritica: { backgroundColor: colors.dangerLight },
  severidadPreventiva: { backgroundColor: colors.warningLight },
  estadoPendiente: { backgroundColor: colors.warningLight },
  estadoAtendido: { backgroundColor: colors.successLight },
  estadoDescartado: { backgroundColor: '#F1F5F9' },
  tituloAlerta: { fontSize: 18, fontWeight: '800', color: colors.text },
  datosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  dato: { minWidth: 210, flexGrow: 1, flexBasis: 280, gap: 5 },
  valorDato: { color: colors.text, fontSize: 14, fontWeight: '600' },
  observaciones: { borderRadius: 9, padding: 14, backgroundColor: colors.canvas, gap: 7 },
  nota: { backgroundColor: colors.infoLight, borderRadius: 10, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  textoNota: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19 },
  errorPanel: { borderRadius: 10, borderWidth: 1, borderColor: colors.danger, padding: 12, backgroundColor: colors.dangerLight, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  errorTexto: { color: colors.danger, flex: 1, minWidth: 170, fontSize: 13 },
  tabla: { width: '100%' },
  filaTabla: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13 },
  encabezadoTabla: { backgroundColor: colors.canvas, borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingVertical: 18 },
  tituloColumna: { fontSize: 12, fontWeight: '800', color: colors.muted },
  nombreColumna: { color: colors.text, fontSize: 13, fontWeight: '700' },
  fechaTabla: { color: colors.muted, fontSize: 12 },
  filasTarjetas: { gap: 10 },
  tarjetaMovil: { padding: 13, borderWidth: 1, borderRadius: 10, borderColor: colors.border, gap: 9 },
  tarjetaMovilEncabezado: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nombreTarjeta: { color: colors.text, fontWeight: '700', fontSize: 14, flex: 1, minWidth: 180 },
  filaMovilPie: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  paginacion: { marginTop: 4, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  vacio: { alignItems: 'center', paddingVertical: 33, gap: 8 },
});
