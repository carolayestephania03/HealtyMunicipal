import React, { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { SectionCard } from '../../../components/ui/section-card';
import { AppButton } from '../../../components/ui/app-button';
import { colors } from '../../../constants/theme';
import { useResponsive } from '../../../hooks/use-responsive';
import { useDashboard } from '../hooks/use-dashboard';
import { calcularDashboard, diaValido, nombreNino, numeroDecimal } from '../dashboard-calculos';
import type { DashboardFuente, Id } from '../types';
import {
  Acceso, Barra, DashboardKpi, EtiquetaEstado, GraficaMensual, Separador, Vacio,
} from './dashboard-widgets';

const LABELS: Record<DashboardFuente, string> = {
  ninos: 'Niños', comunidades: 'Comunidades', familias: 'Familias',
  crecimiento: 'Crecimiento', vacunaciones: 'Vacunación', alertas: 'Alertas',
  campanias: 'Campañas', notificaciones: 'Notificaciones',
};

function abrirNino(id: Id) {
  router.push({ pathname: '/ninos/[id]', params: { id: String(id) } });
}
function Conteo({ disponible, valor, sufijo = '' }: { disponible: boolean; valor: number; sufijo?: string }) {
  return <Text style={styles.valorGrande}>{disponible ? `${valor.toLocaleString('es-GT')}${sufijo}` : '—'}</Text>;
}
function FuenteNoDisponible({ nombre, error }: { nombre: string; error?: string }) {
  return <View style={styles.fuenteError}>
    <Ionicons name="alert-circle-outline" color={colors.warning} size={19}/>
    <Text style={styles.fuenteTexto}>{nombre}: información no disponible. {error ?? 'No se recibió una respuesta válida.'}</Text>
  </View>;
}
function Renglon({ titulo, detalle, derecha, onPress }: {
  titulo: string; detalle?: string; derecha?: React.ReactNode; onPress?: () => void;
}) {
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={({ pressed }) => [styles.renglon, pressed && onPress ? { opacity: 0.7 } : undefined]}>
    <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
      <Text style={styles.renglonTitulo} numberOfLines={2}>{titulo}</Text>
      {detalle ? <Text style={styles.renglonDetalle} numberOfLines={2}>{detalle}</Text> : null}
    </View>
    {derecha ?? (onPress ? <Ionicons name="chevron-forward-outline" color={colors.primary} size={17}/> : null)}
  </Pressable>;
}
function Seccion({ children, ancho }: { children: React.ReactNode; ancho: `${number}%` }) {
  return <View style={{ width: ancho, minWidth: 0 }}>{children}</View>;
}

export function DashboardScreen() {
  const { width } = useResponsive();
  const columnasDos: `${number}%` = width >= 1140 ? '48%' : '100%';
  const columnasKpi: `${number}%` = width >= 1360 ? '23.5%' : width >= 760 ? '48%' : '100%';
  const { datos, errores, loading, refresh } = useDashboard();
  const primeraEntrada = useRef(true);

  // Recargar al regresar desde los módulos sin duplicar la consulta inicial.
  useFocusEffect(useCallback(() => {
    if (primeraEntrada.current) primeraEntrada.current = false;
    else refresh();
  }, [refresh]));

  const resumen = useMemo(() => calcularDashboard(datos), [datos]);
  const ok = (fuente: DashboardFuente) => Array.isArray(datos[fuente]);
  const disponibilidad = (fuentes: DashboardFuente[]) => fuentes.every(ok);
  const ninosOk = ok('ninos');
  const centrosOk = ok('comunidades');
  const familiasOk = ok('familias');
  const crecimientoOk = ok('crecimiento');
  const vacunacionOk = ok('vacunaciones');
  const alertasOk = ok('alertas');
  const campaniasOk = ok('campanias');
  const notificacionesOk = ok('notificaciones');
  const pendientesOK = ninosOk && crecimientoOk;
  const comunidadesDetalleOk = disponibilidad(['ninos', 'comunidades', 'familias']);
  const fallidas = Object.entries(errores).filter(([, mensaje]) => Boolean(mensaje));
  const fmt = (fecha: string | null | undefined) => diaValido(fecha) ?? 'Sin fecha';

  return (
    <ScreenContainer>
      <ScreenHeader title="Dashboard" description="Panel de supervisión de crecimiento, vacunación, comunidades, alertas y actividad operativa del SCCVI."/>
      <View style={styles.barraSuperior}>
        <View style={{ flex: 1, minWidth: 190, gap: 4 }}>
          <Text style={styles.barraTitulo}>Resumen operativo</Text>
          <Text style={styles.barraSubtitulo}>Cifras consultadas desde PostgreSQL · Fecha local: {resumen.hoy}</Text>
        </View>
        <AppButton label={loading ? 'Consultando…' : 'Actualizar información'} onPress={refresh} disabled={loading} variant="outline"/>
      </View>

      {loading ? <View style={styles.cargando}><ActivityIndicator size="small" color={colors.primary}/><Text style={styles.textoMuted}>Actualizando indicadores del sistema…</Text></View> : null}
      {fallidas.length > 0 ? <View style={styles.advertencia}>
        <Text style={styles.advertenciaTitulo}>Fuentes que no pudieron consultarse</Text>
        <Text style={styles.advertenciaTexto}>Se muestran únicamente los datos disponibles; una consulta fallida aparece como «—», no como cero.</Text>
        {fallidas.map(([key, mensaje]) => <Text key={key} style={styles.advertenciaTexto}>• {LABELS[key as DashboardFuente]}: {mensaje}</Text>)}
      </View> : null}

      {/* INDICADORES PRINCIPALES */}
      <View style={styles.kpis}>
        <DashboardKpi width={columnasKpi} etiqueta="Niños registrados" valor={ninosOk ? resumen.registrados : '—'} detalle={ninosOk ? `${resumen.activos} activos · ${resumen.menoresDos} menores de 2 años` : 'No disponible'} icono="people-outline"/>
        <DashboardKpi width={columnasKpi} etiqueta="Comunidades activas" valor={centrosOk ? resumen.comunidadesActivas : '—'} detalle={centrosOk ? `${resumen.totalComunidades} registradas en total` : 'No disponible'} icono="location-outline" tono="success"/>
        <DashboardKpi width={columnasKpi} etiqueta="Familias registradas" valor={familiasOk ? resumen.totalFamilias : '—'} detalle="Familias almacenadas, no estimadas" icono="home-outline"/>
        <DashboardKpi width={columnasKpi} etiqueta="Controles del mes" valor={crecimientoOk ? resumen.controlesMes : '—'} detalle={crecimientoOk ? `${resumen.totalControles} mediciones registradas en total` : 'No disponible'} icono="trending-up-outline" tono="success"/>
        <DashboardKpi width={columnasKpi} etiqueta="Sin control en 90 días" valor={pendientesOK ? resumen.sinControl90.length : '—'} detalle="Niños activos sin registro reciente o sin controles" icono="calendar-outline" tono="warning"/>
        <DashboardKpi width={columnasKpi} etiqueta="Dosis atrasadas" valor={vacunacionOk ? resumen.vacunacionPorEstado.ATRASADA : '—'} detalle="Según estado registrado en la API" icono="medkit-outline" tono="danger"/>
        <DashboardKpi width={columnasKpi} etiqueta="Alertas pendientes" valor={alertasOk ? resumen.alertasAbiertas.length : '—'} detalle={alertasOk ? `${resumen.alertasCriticas.length} críticas pendientes` : 'No disponible'} icono="warning-outline" tono="warning"/>
        <DashboardKpi width={columnasKpi} etiqueta="Avance de dosis registradas" valor={vacunacionOk ? (resumen.porcentajeAplicadas == null ? '—' : `${resumen.porcentajeAplicadas}%`) : '—'} detalle="Aplicadas / dosis con registro · No es cobertura oficial" icono="checkmark-circle-outline" tono="success"/>
      </View>

      {/* EVOLUCIÓN TEMPORAL */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Controles de crecimiento" detalle="Evolución de mediciones registradas durante los últimos 12 meses"/>
            {crecimientoOk ? <GraficaMensual datos={resumen.crecimientoMensual} color={colors.primary}/> : <FuenteNoDisponible nombre="Crecimiento" error={errores.crecimiento}/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Vacunas aplicadas por mes" detalle="Aplicaciones registradas; no representa cobertura poblacional"/>
            {vacunacionOk ? <GraficaMensual datos={resumen.vacunacionMensual} color={colors.success}/> : <FuenteNoDisponible nombre="Vacunaciones" error={errores.vacunaciones}/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* ESTADO VACUNACIÓN Y DISTRIBUCIÓN */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Estado de vacunación" detalle="Conteo de dosis previamente registradas, no del esquema completo" derecha={<Pressable onPress={() => router.push('/vacunacion')} accessibilityRole="button"><Text style={styles.link}>Ir a Vacunación →</Text></Pressable>}/>
            {vacunacionOk ? <>
              <View style={styles.estadosVacuna}>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.vacunacionPorEstado.APLICADA}/><EtiquetaEstado valor="Aplicadas" tono="success"/></View>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.vacunacionPorEstado.PENDIENTE}/><EtiquetaEstado valor="Pendientes" tono="warning"/></View>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.vacunacionPorEstado.ATRASADA}/><EtiquetaEstado valor="Atrasadas" tono="danger"/></View>
              </View>
              {resumen.totalDosis > 0 ? <>
                <Barra etiqueta="Aplicadas" valor={resumen.vacunacionPorEstado.APLICADA} maximo={resumen.totalDosis} detalle={`${resumen.porcentajeAplicadas}%`} color={colors.success}/>
                <Barra etiqueta="Pendientes" valor={resumen.vacunacionPorEstado.PENDIENTE} maximo={resumen.totalDosis} color={colors.warning}/>
                <Barra etiqueta="Atrasadas" valor={resumen.vacunacionPorEstado.ATRASADA} maximo={resumen.totalDosis} color={colors.danger}/>
              </> : <Vacio texto="No hay dosis registradas en la base de datos."/>}
            </> : <FuenteNoDisponible nombre="Vacunaciones" error={errores.vacunaciones}/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Niños por comunidad" detalle="Niños activos asignados a familias de cada comunidad" derecha={<Pressable onPress={() => router.push('/comunidades')} accessibilityRole="button"><Text style={styles.link}>Ver Comunidades →</Text></Pressable>}/>
            {comunidadesDetalleOk ? resumen.comunidadesResumen.length ? <>
              {resumen.comunidadesResumen.slice(0, 8).map(row => <Barra key={String(row.id)} etiqueta={row.nombre} valor={row.ninos} maximo={Math.max(1, resumen.comunidadesResumen[0]?.ninos ?? 1)} detalle={`${row.ninos} niños · ${row.familias} fam.`}/>)}
              {resumen.comunidadesResumen.length > 8 ? <Text style={styles.textoMuted}>Se muestran 8 comunidades de {resumen.comunidadesResumen.length}.</Text> : null}
            </> : <Vacio texto="No hay comunidades registradas."/> : <FuenteNoDisponible nombre="Niños / Familias / Comunidades" error="No se pudo consultar alguna de las fuentes necesarias."/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* SEGUIMIENTO Y DOSIS PRÓXIMAS */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Seguimiento pendiente de crecimiento" detalle="Niños activos sin controles o con última medición anterior a 90 días" derecha={<Pressable onPress={() => router.push('/crecimiento')} accessibilityRole="button"><Text style={styles.link}>Ir a Crecimiento →</Text></Pressable>}/>
            {pendientesOK ? resumen.sinControl90.length ? <>
              {resumen.sinControl90.slice(0, 6).map(({ nino, ultimaFecha }) => <Renglon key={String(nino.id_nino)} titulo={nombreNino(nino)} detalle={`${nino.codigo_expediente} · ${ultimaFecha ? `Último control: ${ultimaFecha}` : 'Sin controles'}`} onPress={() => abrirNino(nino.id_nino)}/>)}
              {resumen.sinControl90.length > 6 ? <Text style={styles.textoMuted}>Hay {resumen.sinControl90.length - 6} niños adicionales pendientes de seguimiento.</Text> : null}
            </> : <Vacio texto="Los niños activos tienen controles registrados dentro del intervalo operativo revisado."/> : <FuenteNoDisponible nombre="Seguimiento" error="Se necesitan Niños y Crecimiento."/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Próximas dosis · 30 días" detalle="Dosis PENDIENTES cuya fecha programada está entre hoy y los próximos 30 días" derecha={<Pressable onPress={() => router.push('/vacunacion')} accessibilityRole="button"><Text style={styles.link}>Ver todas →</Text></Pressable>}/>
            {vacunacionOk ? resumen.dosisProximas.length ? <>
              {resumen.dosisProximas.slice(0, 6).map((dosis, i) => {
                const n = resumen.nombres.get(String(dosis.id_nino));
                const vacuna = dosis.esquema?.vacuna?.nombre ?? 'Vacuna no identificada';
                return <Renglon key={`${dosis.id_vacunacion_nino}-${i}`} titulo={`${vacuna} · Dosis ${dosis.esquema?.numero_dosis ?? '—'}`} detalle={`${ninosOk ? nombreNino(n) : `Niño ${dosis.id_nino}`} · ${fmt(dosis.fecha_programada)}`} onPress={() => abrirNino(dosis.id_nino)}/>;
              })}
              {resumen.dosisProximas.length > 6 ? <Text style={styles.textoMuted}>{resumen.dosisProximas.length - 6} dosis adicionales programadas.</Text> : null}
            </> : <Vacio texto="No hay dosis pendientes programadas para los próximos 30 días."/> : <FuenteNoDisponible nombre="Vacunaciones" error={errores.vacunaciones}/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* EDADES Y SEÑALES PREVENTIVAS REGISTRADAS */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Distribución de niños por edades" detalle="Niños activos, según fecha de nacimiento registrada"/>
            {ninosOk ? <>
              {resumen.gruposEdad.map((grupo) => <Barra key={grupo.etiqueta} etiqueta={grupo.etiqueta} valor={grupo.total} maximo={Math.max(1, resumen.activos)} detalle={String(grupo.total)} color={colors.primary}/>)}
              <Text style={styles.textoMuted}>No se contabilizan en estos grupos los registros cuya fecha de nacimiento no es válida.</Text>
            </> : <FuenteNoDisponible nombre="Niños" error={errores.ninos}/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Señales preventivas registradas" detalle="Alertas abiertas emitidas por Express; no generan diagnósticos nuevos" derecha={<Pressable onPress={() => router.push('/alertas')} accessibilityRole="button"><Text style={styles.link}>Gestionar alertas →</Text></Pressable>}/>
            {alertasOk ? <>
              <Barra etiqueta="Alertas de crecimiento" valor={resumen.alertasCrecimiento.length} maximo={Math.max(1, resumen.alertasAbiertas.length)} detalle={String(resumen.alertasCrecimiento.length)} color={colors.warning}/>
              <Barra etiqueta="Alertas de vacunación atrasada" valor={resumen.alertasVacunacion.length} maximo={Math.max(1, resumen.alertasAbiertas.length)} detalle={String(resumen.alertasVacunacion.length)} color={colors.danger}/>
              <Barra etiqueta="Críticas abiertas (todos los tipos)" valor={resumen.alertasCriticas.length} maximo={Math.max(1, resumen.alertasAbiertas.length)} detalle={String(resumen.alertasCriticas.length)} color={colors.danger}/>
              <Text style={styles.textoMuted}>Los tipos de alerta se muestran tal como están registrados. Revisar referencias OMS y reglas del backend antes de interpretaciones clínicas.</Text>
            </> : <FuenteNoDisponible nombre="Alertas" error={errores.alertas}/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* ALERTAS Y ACTIVIDAD */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Alertas que requieren atención" detalle="Pendientes según estado registrado; las críticas aparecen primero" derecha={<Pressable onPress={() => router.push('/alertas')} accessibilityRole="button"><Text style={styles.link}>Abrir Alertas →</Text></Pressable>}/>
            {alertasOk ? resumen.alertasPrioridad.length ? <>
              {resumen.alertasPrioridad.slice(0, 6).map(a => <Renglon key={String(a.id_alerta)} titulo={a.titulo || a.tipo_alerta || 'Alerta sin título'} detalle={`${fmt(a.fecha_generacion)} · ${a.id_nino ? `Niño ${a.id_nino}` : 'Sin niño asociado'}`} derecha={<EtiquetaEstado valor={a.severidad} tono={a.severidad === 'CRITICA' ? 'danger' : 'warning'}/>} onPress={a.id_nino ? () => abrirNino(a.id_nino!) : () => router.push('/alertas')}/>)}
              {resumen.alertasPrioridad.length > 6 ? <Text style={styles.textoMuted}>Hay {resumen.alertasPrioridad.length - 6} alertas pendientes adicionales.</Text> : null}
            </> : <Vacio texto="No hay alertas pendientes registradas."/> : <FuenteNoDisponible nombre="Alertas" error={errores.alertas}/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Controles de crecimiento recientes" detalle="Últimas ocho mediciones registradas" derecha={<Pressable onPress={() => router.push('/crecimiento')} accessibilityRole="button"><Text style={styles.link}>Ver historial →</Text></Pressable>}/>
            {crecimientoOk ? resumen.recientes.length ? resumen.recientes.map(reg => {
              const n = resumen.nombres.get(String(reg.id_nino));
              const peso = numeroDecimal(reg.peso_kg);
              const talla = numeroDecimal(reg.talla_cm);
              return <Renglon key={String(reg.id_registro)} titulo={ninosOk ? nombreNino(n) : `Niño ${reg.id_nino}`} detalle={`${fmt(reg.fecha_medicion)} · ${peso == null ? '—' : peso.toFixed(2)} kg · ${talla == null ? '—' : talla.toFixed(1)} cm`} onPress={() => abrirNino(reg.id_nino)}/>;
            }) : <Vacio texto="No existen controles de crecimiento registrados."/> : <FuenteNoDisponible nombre="Crecimiento" error={errores.crecimiento}/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* CAMPAÑAS Y NOTIFICACIONES */}
      <View style={styles.dosColumnas}>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Campañas programadas o en proceso" detalle="Agenda recuperada de /api/campanias" derecha={<Pressable onPress={() => router.push('/campanias')} accessibilityRole="button"><Text style={styles.link}>Ver Campañas →</Text></Pressable>}/>
            {campaniasOk ? resumen.campaniasProximas.length ? resumen.campaniasProximas.slice(0, 6).map(c =>
              <Renglon key={String(c.id_campania)} titulo={c.titulo} detalle={`${fmt(c.fecha_programada)} · ${c.canal ?? 'Sin canal'}`} derecha={<EtiquetaEstado valor={c.estado} tono={c.estado === 'EN_PROCESO' ? 'success' : 'info'}/>} onPress={() => router.push('/campanias')}/>
            ) : <Vacio texto="No hay campañas programadas o en proceso."/> : <FuenteNoDisponible nombre="Campañas" error={errores.campanias}/>}
          </SectionCard>
        </Seccion>
        <Seccion ancho={columnasDos}>
          <SectionCard>
            <Separador titulo="Estado de notificaciones" detalle="Envíos reales registrados por la API; sin mostrar destinatarios" derecha={<Pressable onPress={() => router.push('/campanias')} accessibilityRole="button"><Text style={styles.link}>Campañas →</Text></Pressable>}/>
            {notificacionesOk ? <>
              <View style={styles.estadosVacuna}>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.notificacionesPorEstado.ENVIADA}/><EtiquetaEstado valor="Enviadas" tono="success"/></View>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.notificacionesPorEstado.PENDIENTE}/><EtiquetaEstado valor="Pendientes" tono="warning"/></View>
                <View style={styles.estadoCaja}><Conteo disponible valor={resumen.notificacionesPorEstado.ERROR}/><EtiquetaEstado valor="Con error" tono="danger"/></View>
              </View>
              {resumen.notificacionesPorCanal.map(c => <Barra key={c.canal} etiqueta={c.canal} valor={c.total} maximo={Math.max(1, ...(resumen.notificacionesPorCanal.map(x=>x.total)))}/>)}
            </> : <FuenteNoDisponible nombre="Notificaciones" error={errores.notificaciones}/>}
          </SectionCard>
        </Seccion>
      </View>

      {/* ENLACES */}
      <SectionCard>
        <Separador titulo="Accesos rápidos" detalle="Ir directamente a los módulos administrativos y clínicos"/>
        <View style={styles.accesos}>
          <Seccion ancho={columnasDos}><Acceso titulo="Niños" subtitulo="Registrar y consultar expedientes" icono="people-outline" onPress={() => router.push('/ninos')}/></Seccion>
          <Seccion ancho={columnasDos}><Acceso titulo="Crecimiento" subtitulo="Peso, talla e historial" icono="trending-up-outline" onPress={() => router.push('/crecimiento')}/></Seccion>
          <Seccion ancho={columnasDos}><Acceso titulo="Vacunación" subtitulo="Dosis aplicadas y pendientes" icono="medkit-outline" onPress={() => router.push('/vacunacion')}/></Seccion>
          <Seccion ancho={columnasDos}><Acceso titulo="Comunidades" subtitulo="Distribución y mantenimiento" icono="location-outline" onPress={() => router.push('/comunidades')}/></Seccion>
          <Seccion ancho={columnasDos}><Acceso titulo="Padres y familias" subtitulo="Tutores e hijos vinculados" icono="home-outline" onPress={() => router.push('/padres')}/></Seccion>
          <Seccion ancho={columnasDos}><Acceso titulo="Alertas" subtitulo="Casos que requieren seguimiento" icono="warning-outline" onPress={() => router.push('/alertas')}/></Seccion>
        </View>
      </SectionCard>
      <View style={styles.pie}>
        <Ionicons name="information-circle-outline" color={colors.muted} size={17}/>
        <Text style={styles.textoMuted}>«Sin control en 90 días» es un indicador operativo, no un diagnóstico. El avance de dosis se calcula solo con vacunaciones registradas, no con toda la población objetivo. Si utilizaste el seed demostrativo, sus percentiles y esquemas no son resultados clínicos validados. El aislamiento por centro de salud debe aplicarse en Express.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  barraSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingVertical: 4 },
  barraTitulo: { fontSize: 17, color: colors.text, fontWeight: '800' },
  barraSubtitulo: { fontSize: 12, color: colors.muted },
  cargando: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, backgroundColor: colors.infoLight, borderRadius: 9 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dosColumnas: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  estadosVacuna: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 5 },
  estadoCaja: { flexGrow: 1, minWidth: 110, gap: 8, borderRadius: 10, backgroundColor: colors.canvas, padding: 12 },
  valorGrande: { fontSize: 23, fontWeight: '800', color: colors.text },
  link: { fontSize: 12, fontWeight: '700', color: colors.primary },
  advertencia: { borderWidth: 1, borderColor: '#F2D9AA', backgroundColor: colors.warningLight, borderRadius: 11, padding: 14, gap: 5 },
  advertenciaTitulo: { fontSize: 13, color: colors.text, fontWeight: '800' },
  advertenciaTexto: { fontSize: 11, color: '#795700', lineHeight: 18 },
  fuenteError: { flexDirection: 'row', padding: 12, gap: 9, alignItems: 'center', borderRadius: 10, backgroundColor: colors.warningLight },
  fuenteTexto: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19 },
  renglon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  renglonTitulo: { color: colors.text, fontWeight: '700', fontSize: 12 },
  renglonDetalle: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  textoMuted: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  accesos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pie: { flexDirection: 'row', gap: 8, paddingVertical: 8, alignItems: 'flex-start' },
});
