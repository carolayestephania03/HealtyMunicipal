import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import type { LayoutChangeEvent } from 'react-native';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { useResponsive } from '../../../hooks/use-responsive';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../auth/hooks/use-auth';
import { useDashboard } from '../../dashboard/hooks/use-dashboard';
import {
  calcularDashboard,
  diaValido,
  nombreNino,
} from '../../dashboard/dashboard-calculos';
import type { DashboardFuente, Id } from '../../dashboard/types';

type Icono = React.ComponentProps<typeof Ionicons>['name'];
type Tono = 'info' | 'success' | 'warning' | 'danger';

const paletas: Record<Tono, { fondo: string; tinta: string }> = {
  info: { fondo: colors.infoLight, tinta: colors.primary },
  success: { fondo: colors.successLight, tinta: colors.success },
  warning: { fondo: colors.warningLight, tinta: colors.warning },
  danger: { fondo: colors.dangerLight, tinta: colors.danger },
};

const nombresFuentes: Record<DashboardFuente, string> = {
  ninos: 'Niños',
  comunidades: 'Comunidades',
  familias: 'Familias',
  crecimiento: 'Crecimiento',
  vacunaciones: 'Vacunaciones',
  alertas: 'Alertas',
  campanias: 'Campañas',
  notificaciones: 'Notificaciones',
};

function navegar(ruta: Href) {
  router.push(ruta);
}

function abrirExpediente(id: Id) {
  router.push({
    pathname: '/ninos/[id]',
    params: { id: String(id) },
  });
}

function fechaVisible(valor: string | null | undefined): string {
  const fecha = diaValido(valor);
  if (!fecha) return 'Sin fecha';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function fechaLarga(fecha: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function IconoCaja({ icono, tono = 'info', size = 21 }: {
  icono: Icono;
  tono?: Tono;
  size?: number;
}) {
  const paleta = paletas[tono];
  return (
    <View style={[styles.iconoCaja, { backgroundColor: paleta.fondo }]}>
      <Ionicons name={icono} size={size} color={paleta.tinta} />
    </View>
  );
}

function TarjetaKpi({ titulo, valor, detalle, icono, tono, ancho, onPress }: {
  titulo: string;
  valor: number | string;
  detalle: string;
  icono: Icono;
  tono: Tono;
  ancho: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}: ${valor}. ${detalle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.kpi, { width: ancho }, pressed && styles.presionado]}
    >
      <View style={styles.kpiCabecera}>
        <IconoCaja icono={icono} tono={tono} />
        <Ionicons name="arrow-forward" size={17} color={colors.muted} />
      </View>
      <Text style={styles.kpiValor}>{valor}</Text>
      <Text style={styles.kpiTitulo}>{titulo}</Text>
      <Text style={styles.kpiDetalle}>{detalle}</Text>
    </Pressable>
  );
}

function Seccion({ titulo, subtitulo, icono, link, onLink, children }: {
  titulo: string;
  subtitulo?: string;
  icono: Icono;
  link?: string;
  onLink?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.seccion}>
      <View style={styles.seccionHeader}>
        <IconoCaja icono={icono} />
        <View style={styles.seccionTitulos}>
          <Text style={styles.seccionTitulo}>{titulo}</Text>
          {subtitulo ? <Text style={styles.seccionSubtitulo}>{subtitulo}</Text> : null}
        </View>
        {link && onLink ? (
          <Pressable onPress={onLink} accessibilityRole="button" accessibilityLabel={link}>
            <Text style={styles.enlace}>{link} ›</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function AccesoRapido({ titulo, detalle, icono, onPress, ancho }: {
  titulo: string;
  detalle: string;
  icono: Icono;
  onPress: () => void;
  ancho: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      style={({ pressed }) => [styles.acceso, { width: ancho }, pressed && styles.presionado]}
    >
      <IconoCaja icono={icono} />
      <View style={styles.accesoTextos}>
        <Text style={styles.accesoTitulo}>{titulo}</Text>
        <Text style={styles.accesoDetalle} numberOfLines={2}>{detalle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </Pressable>
  );
}

function Fila({ titulo, detalle, icono, tono = 'info', onPress }: {
  titulo: string;
  detalle: string;
  icono: Icono;
  tono?: Tono;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${detalle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.fila, pressed && styles.presionado]}
    >
      <IconoCaja icono={icono} tono={tono} size={18} />
      <View style={styles.filaContenido}>
        <Text style={styles.filaTitulo} numberOfLines={2}>{titulo}</Text>
        <Text style={styles.filaDetalle} numberOfLines={2}>{detalle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </Pressable>
  );
}

function SinDatos({ texto }: { texto: string }) {
  return (
    <View style={styles.sinDatos}>
      <Ionicons name="information-circle-outline" size={21} color={colors.muted} />
      <Text style={styles.sinDatosTexto}>{texto}</Text>
    </View>
  );
}

export default function InicioScreen() {
  const { session } = useAuth();
  const { isMobile, width: anchoVentana } = useResponsive();
  const { datos, errores, loading, refresh } = useDashboard();
  const primeraApertura = useRef(true);
  const [hoy, setHoy] = useState(() => new Date());
  const [anchoTarjetas, setAnchoTarjetas] = useState(0);
  const [anchoAccesos, setAnchoAccesos] = useState(0);

  // Al volver desde otro módulo se recuperan los datos actuales de Express.
  useFocusEffect(useCallback(() => {
    setHoy(new Date());
    if (primeraApertura.current) {
      primeraApertura.current = false;
    } else {
      refresh();
    }
  }, [refresh]));

  const resumen = useMemo(() => calcularDashboard(datos, hoy), [datos, hoy]);
  const usuario = session?.usuario;
  const primerNombre = usuario?.nombres?.trim().split(/\s+/)[0] || 'personal de salud';
  const roles = usuario?.roles?.join(', ') || 'Personal autorizado';
  const centro = usuario?.centro_salud;
  const centroNombre = centro && typeof centro.nombre === 'string' && centro.nombre.trim()
    ? centro.nombre
    : usuario?.id_centro == null ? 'Administración general' : 'Centro de salud asignado';

  const saludo = hoy.getHours() < 12 ? 'Buenos días' : hoy.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  const ninosDisponibles = Array.isArray(datos.ninos);
  const crecimientoDisponible = Array.isArray(datos.crecimiento);
  const vacunasDisponibles = Array.isArray(datos.vacunaciones);
  const alertasDisponibles = Array.isArray(datos.alertas);
  const pendientesDisponibles = ninosDisponibles && crecimientoDisponible;
  const erroresActivos = (Object.keys(errores) as DashboardFuente[]).filter(key => !!errores[key]);

  const numColumnasKpi = (anchoTarjetas || anchoVentana) < 480 ? 1
    : (anchoTarjetas || anchoVentana) < 900 ? 2 : 4;
  const numColumnasAccesos = (anchoAccesos || anchoVentana) < 550 ? 1
    : (anchoAccesos || anchoVentana) < 1000 ? 2 : 3;
  const kpiWidth = Math.max(0, ((anchoTarjetas || 820) - (numColumnasKpi - 1) * 12) / numColumnasKpi);
  const accesoWidth = Math.max(0, ((anchoAccesos || 820) - (numColumnasAccesos - 1) * 10) / numColumnasAccesos);

  const onLayoutKpi = (event: LayoutChangeEvent) => {
    const nuevo = Math.round(event.nativeEvent.layout.width);
    if (nuevo > 0 && nuevo !== anchoTarjetas) setAnchoTarjetas(nuevo);
  };
  const onLayoutAccesos = (event: LayoutChangeEvent) => {
    const nuevo = Math.round(event.nativeEvent.layout.width);
    if (nuevo > 0 && nuevo !== anchoAccesos) setAnchoAccesos(nuevo);
  };

  const accesos: { titulo: string; detalle: string; icono: Icono; ruta: Href }[] = [
    { titulo: 'Registrar niño', detalle: 'Crear un expediente infantil', icono: 'person-add-outline', ruta: '/ninos/nuevo' },
    { titulo: 'Crecimiento', detalle: 'Registrar peso, talla y controles', icono: 'trending-up-outline', ruta: '/crecimiento' },
    { titulo: 'Vacunación', detalle: 'Consultar y aplicar dosis', icono: 'medkit-outline', ruta: '/vacunacion' },
    { titulo: 'Padres y familias', detalle: 'Gestionar responsables y vínculos', icono: 'people-outline', ruta: '/padres' },
    { titulo: 'Comunidades', detalle: 'Consultar comunidades y centros', icono: 'location-outline', ruta: '/comunidades' },
    { titulo: 'Carnet digital QR', detalle: 'Emitir o consultar carnets', icono: 'qr-code-outline', ruta: '/carnet-qr' },
  ];

  return (
    <ScreenContainer>
      {/* PORTADA - La página Inicio es un espacio operativo, no otro Dashboard. */}
      <View style={styles.hero}>
        <View style={styles.decoracion1} />
        <View style={styles.decoracion2} />
        <View style={styles.heroContenido}>
          <View style={styles.heroEtiqueta}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#B9ECF6" />
            <Text style={styles.heroEtiquetaTexto}>SCCVI · PANEL DE INICIO</Text>
          </View>
          <Text style={styles.heroTitulo}>{saludo}, {primerNombre}</Text>
          <Text style={styles.heroSubtitulo}>
            Este es tu espacio de trabajo para dar seguimiento al crecimiento,
            la vacunación y la atención infantil.
          </Text>
          <View style={styles.heroMetadatos}>
            <View style={styles.heroMeta}>
              <Ionicons name="calendar-outline" size={16} color="#D7F1FA" />
              <Text style={styles.heroMetaTexto}>{fechaLarga(hoy)}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Ionicons name="medical-outline" size={16} color="#D7F1FA" />
              <Text style={styles.heroMetaTexto}>{centroNombre}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Ionicons name="person-circle-outline" size={16} color="#D7F1FA" />
              <Text style={styles.heroMetaTexto}>{roles}</Text>
            </View>
          </View>
          <View style={styles.heroAcciones}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navegar('/dashboard')}
              style={({ pressed }) => [styles.botonBlanco, pressed && styles.presionado]}
            >
              <Ionicons name="stats-chart-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.botonBlancoTexto}>Ver Dashboard</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={refresh}
              style={({ pressed }) => [styles.botonTransparente, pressed && styles.presionado]}
            >
              <Ionicons name="refresh-outline" size={17} color="#FFFFFF" />
              <Text style={styles.botonTransparenteTexto}>Actualizar datos</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.cabeceraBloque}>
        <View style={styles.encabezadoTextos}>
          <Text style={styles.bloqueTitulo}>Resumen de atención</Text>
          <Text style={styles.bloqueSubtitulo}>Indicadores operativos del sistema, obtenidos desde la API.</Text>
        </View>
        {loading ? <View style={styles.actualizando}><ActivityIndicator color={colors.primary} size="small"/><Text style={styles.auxiliar}>Actualizando...</Text></View> : null}
      </View>

      <View style={styles.kpis} onLayout={onLayoutKpi}>
        <TarjetaKpi titulo="Niños activos" valor={ninosDisponibles ? resumen.activos : '—'}
          detalle="Registros con estado activo" icono="people-outline" tono="info" ancho={kpiWidth}
          onPress={() => navegar('/ninos')} />
        <TarjetaKpi titulo="Seguimiento pendiente" valor={pendientesDisponibles ? resumen.sinControl90.length : '—'}
          detalle="Sin control en los últimos 90 días" icono="calendar-outline" tono="warning" ancho={kpiWidth}
          onPress={() => navegar('/crecimiento')} />
        <TarjetaKpi titulo="Dosis atrasadas" valor={vacunasDisponibles ? resumen.vacunacionPorEstado.ATRASADA : '—'}
          detalle="Según estado registrado en la API" icono="medkit-outline" tono="danger" ancho={kpiWidth}
          onPress={() => navegar('/vacunacion')} />
        <TarjetaKpi titulo="Alertas pendientes" valor={alertasDisponibles ? resumen.alertasAbiertas.length : '—'}
          detalle="Registros marcados como pendientes" icono="notifications-outline" tono="warning" ancho={kpiWidth}
          onPress={() => navegar('/alertas')} />
      </View>

      {erroresActivos.length > 0 ? (
        <View style={styles.aviso}>
          <Ionicons name="alert-circle-outline" color={colors.warning} size={20}/>
          <Text style={styles.avisoTexto}>
            Algunas fuentes no están disponibles: {erroresActivos.map(f => nombresFuentes[f]).join(', ')}.
            Los valores marcados con «—» no representan cero. Revisa los permisos o la conexión.
          </Text>
        </View>
      ) : null}

      <View style={styles.dosColumnas}>
        <View style={[styles.columna, isMobile && styles.columnaMovil]}>
          <Seccion titulo="Prioridades de seguimiento" subtitulo="Pendientes que conviene revisar" icono="alert-circle-outline"
            link="Ver alertas" onLink={() => navegar('/alertas')}>
            {alertasDisponibles && resumen.alertasCriticas.length > 0 ? (
              <Fila titulo={`${resumen.alertasCriticas.length} alerta(s) crítica(s) pendiente(s)`}
                detalle="Revisar registros y acciones de atención" icono="warning-outline" tono="danger"
                onPress={() => navegar('/alertas')} />
            ) : null}
            {vacunasDisponibles && resumen.vacunacionPorEstado.ATRASADA > 0 ? (
              <Fila titulo={`${resumen.vacunacionPorEstado.ATRASADA} dosis registrada(s) como atrasada(s)`}
                detalle="Verificar el historial y la programación de vacunas" icono="medkit-outline" tono="warning"
                onPress={() => navegar('/vacunacion')} />
            ) : null}
            {pendientesDisponibles && resumen.sinControl90.length > 0 ? (
              <Fila titulo={`${resumen.sinControl90.length} niño(s) con seguimiento pendiente`}
                detalle="Sin controles o sin medición en los últimos 90 días" icono="trending-up-outline" tono="warning"
                onPress={() => navegar('/crecimiento')} />
            ) : null}
            {(alertasDisponibles && vacunasDisponibles && pendientesDisponibles &&
              resumen.alertasCriticas.length === 0 && resumen.vacunacionPorEstado.ATRASADA === 0 &&
              resumen.sinControl90.length === 0) ? (
                <SinDatos texto="No se detectaron pendientes en las fuentes consultadas." />
              ) : null}
            {(!alertasDisponibles || !vacunasDisponibles || !pendientesDisponibles) ? (
              <Text style={styles.nota}>La revisión es parcial porque algunas fuentes no están disponibles.</Text>
            ) : null}
          </Seccion>
        </View>

        <View style={[styles.columna, isMobile && styles.columnaMovil]}>
          <Seccion titulo="Próximas vacunas" subtitulo="Dosis pendientes programadas en los próximos 30 días"
            icono="calendar-number-outline" link="Ver vacunación" onLink={() => navegar('/vacunacion')}>
            {!vacunasDisponibles ? <SinDatos texto="No se pudo consultar la programación de vacunas." /> :
              resumen.dosisProximas.length ? resumen.dosisProximas.slice(0, 4).map(dosis => {
                const n = resumen.nombres.get(String(dosis.id_nino));
                return (
                  <Fila key={String(dosis.id_vacunacion_nino)}
                    titulo={`${dosis.esquema?.vacuna?.nombre || 'Vacuna registrada'} · dosis ${dosis.esquema?.numero_dosis ?? '—'}`}
                    detalle={`${ninosDisponibles ? nombreNino(n) : `Niño ${dosis.id_nino}`} · ${fechaVisible(dosis.fecha_programada)}`}
                    icono="calendar-outline" tono="info"
                    onPress={() => abrirExpediente(dosis.id_nino)} />
                );
              }) : <SinDatos texto="No hay dosis pendientes programadas para los próximos 30 días." />
            }
            {vacunasDisponibles && resumen.dosisProximas.length > 4 ?
              <Text style={styles.nota}>Hay {resumen.dosisProximas.length - 4} dosis programadas adicionales.</Text> : null}
          </Seccion>
        </View>
      </View>

      <View style={styles.cabeceraBloque}>
        <View style={styles.encabezadoTextos}>
          <Text style={styles.bloqueTitulo}>Acciones rápidas</Text>
          <Text style={styles.bloqueSubtitulo}>Accede directamente a las tareas más frecuentes.</Text>
        </View>
      </View>
      <View style={styles.accesos} onLayout={onLayoutAccesos}>
        {accesos.map(item => (
          <AccesoRapido key={item.titulo} titulo={item.titulo} detalle={item.detalle}
            icono={item.icono} ancho={accesoWidth} onPress={() => navegar(item.ruta)} />
        ))}
      </View>

      <View style={styles.dosColumnas}>
        <View style={[styles.columna, isMobile && styles.columnaMovil]}>
          <Seccion titulo="Controles recientes" subtitulo="Últimos registros de peso y talla"
            icono="pulse-outline" link="Ver crecimiento" onLink={() => navegar('/crecimiento')}>
            {!crecimientoDisponible ? <SinDatos texto="No fue posible consultar los controles." /> :
              resumen.recientes.length ? resumen.recientes.slice(0, 4).map(control => {
                const n = resumen.nombres.get(String(control.id_nino));
                return (
                  <Fila key={String(control.id_registro)}
                    titulo={ninosDisponibles ? nombreNino(n) : `Niño ${control.id_nino}`}
                    detalle={`Control: ${fechaVisible(control.fecha_medicion)} · Peso: ${control.peso_kg} kg · Talla: ${control.talla_cm} cm`}
                    icono="fitness-outline" tono="success"
                    onPress={() => abrirExpediente(control.id_nino)} />
                );
              }) : <SinDatos texto="Todavía no existen controles de crecimiento registrados." />
            }
          </Seccion>
        </View>

        <View style={[styles.columna, isMobile && styles.columnaMovil]}>
          <Seccion titulo="Campañas y actividades" subtitulo="Programadas o en proceso"
            icono="megaphone-outline" link="Ver campañas" onLink={() => navegar('/campanias')}>
            {!Array.isArray(datos.campanias) ? <SinDatos texto="No fue posible consultar las campañas." /> :
              resumen.campaniasProximas.length ? resumen.campaniasProximas.slice(0, 4).map(c => (
                <Fila key={String(c.id_campania)} titulo={c.titulo || 'Campaña sin título'}
                  detalle={`${c.estado} · ${fechaVisible(c.fecha_programada)}`}
                  icono="calendar-outline" tono="info" onPress={() => navegar('/campanias')} />
              )) : <SinDatos texto="No hay campañas programadas o en proceso." />
            }
          </Seccion>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir el Dashboard de indicadores y gráficas"
        onPress={() => navegar('/dashboard')}
        style={({ pressed }) => [styles.pie, pressed && styles.presionado]}
      >
        <Ionicons name="bar-chart-outline" size={26} color={colors.primary} />
        <View style={styles.pieTextos}>
          <Text style={styles.pieTitulo}>¿Necesitas un análisis más detallado?</Text>
          <Text style={styles.pieSubtitulo}>Consulta el Dashboard para ver gráficas, distribución territorial y tendencias mensuales.</Text>
        </View>
        <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.primary} />
      </Pressable>
      <Text style={styles.aclaracion}>
        «Sin control en 90 días» es un criterio operativo, no un diagnóstico. Las vacunas
        atrasadas se cuentan según el estado almacenado en el backend. La información
        mostrada depende de los permisos del usuario y de las respuestas de la API.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#07546B', borderRadius: 17, padding: 26,
    minHeight: 255, justifyContent: 'center', overflow: 'hidden', position: 'relative',
  },
  decoracion1: { position: 'absolute', width: 370, height: 370, borderRadius: 190,
    backgroundColor: '#0C6D84', right: -95, top: -215 },
  decoracion2: { position: 'absolute', width: 260, height: 260, borderRadius: 135,
    borderWidth: 35, borderColor: '#1C8AA0', right: -150, bottom: -190, opacity: 0.5 },
  heroContenido: { gap: 11, maxWidth: 950 },
  heroEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroEtiquetaTexto: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: '#B9ECF6' },
  heroTitulo: { fontSize: 29, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitulo: { color: '#DAEEF4', fontSize: 14, lineHeight: 21, maxWidth: 720 },
  heroMetadatos: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  heroMetaTexto: { color: '#DDF1F7', fontSize: 12, flexShrink: 1 },
  heroAcciones: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 13 },
  botonBlanco: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 42,
    paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 9 },
  botonBlancoTexto: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  botonTransparente: { flexDirection: 'row', alignItems: 'center', gap: 8,
    minHeight: 42, paddingHorizontal: 16, borderWidth: 1, borderColor: '#FFFFFF80', borderRadius: 9 },
  botonTransparenteTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  presionado: { opacity: 0.78 },
  cabeceraBloque: { flexDirection: 'row', justifyContent: 'space-between',
    gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 3 },
  encabezadoTextos: { gap: 4, flex: 1, minWidth: 220 },
  bloqueTitulo: { color: colors.text, fontWeight: '800', fontSize: 20 },
  bloqueSubtitulo: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  actualizando: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  auxiliar: { color: colors.muted, fontSize: 12 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 13, padding: 16, minHeight: 160, gap: 5 },
  kpiCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  iconoCaja: { width: 39, height: 39, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  kpiValor: { color: colors.text, fontWeight: '800', fontSize: 26 },
  kpiTitulo: { color: colors.text, fontWeight: '700', fontSize: 13 },
  kpiDetalle: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  aviso: { backgroundColor: colors.warningLight, borderColor: '#F0DBB3', borderWidth: 1,
    borderRadius: 11, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avisoTexto: { color: '#865D16', flex: 1, fontSize: 12, lineHeight: 19 },
  dosColumnas: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  columna: { flexGrow: 1, flexBasis: 390, minWidth: 0, gap: 16 },
  columnaMovil: { flexBasis: '100%', width: '100%' },
  seccion: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 13, padding: 16, gap: 13 },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  seccionTitulos: { flex: 1, minWidth: 160, gap: 4 },
  seccionTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  seccionSubtitulo: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  enlace: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border },
  filaContenido: { flex: 1, minWidth: 0, gap: 5 },
  filaTitulo: { fontSize: 12, fontWeight: '700', color: colors.text },
  filaDetalle: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  sinDatos: { flexDirection: 'row', gap: 9, paddingVertical: 13, alignItems: 'center' },
  sinDatosTexto: { color: colors.muted, fontSize: 12, lineHeight: 18, flex: 1 },
  nota: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  accesos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  acceso: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface,
    borderColor: colors.border, borderWidth: 1, borderRadius: 11, padding: 13, minHeight: 82 },
  accesoTextos: { flex: 1, minWidth: 0, gap: 4 },
  accesoTitulo: { color: colors.text, fontSize: 13, fontWeight: '800' },
  accesoDetalle: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  pie: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1,
    borderColor: '#CFE2F7', borderRadius: 12, padding: 16, backgroundColor: colors.infoLight },
  pieTextos: { flex: 1, minWidth: 0, gap: 4 },
  pieTitulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  pieSubtitulo: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  aclaracion: { color: colors.muted, fontSize: 11, lineHeight: 18 },
});
