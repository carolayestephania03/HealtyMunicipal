import type {
  AlertaDashboard, CampaniaDashboard, ControlDashboard,
  DashboardDatos, Id, NinoDashboard, VacunacionDashboard,
} from './types';

export const CANTIDAD_MESES = 12;

export function fechaLocal(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function diaValido(valor: string | null | undefined): string | null {
  const dia = typeof valor === 'string' ? valor.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null;
  const fecha = new Date(`${dia}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === dia ? dia : null;
}
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
export function mesesEdad(fechaNacimiento: string, hoy: string): number | null {
  const fn = diaValido(fechaNacimiento);
  if (!fn || fn > hoy) return null;
  const [a,m,d] = fn.split('-').map(Number);
  const [ah,mh,dh] = hoy.split('-').map(Number);
  return Math.max(0, (ah - a) * 12 + mh - m - Number(dh < d));
}
export function numeroDecimal(x: number | string | null | undefined): number | null {
  if (x == null || x === '') return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}
export function nombreNino(n?: NinoDashboard): string {
  return n ? `${n.nombres} ${n.apellidos}`.trim() : 'Niño no identificado';
}
export function mesesUltimos12(hoy: Date): { key: string; label: string }[] {
  const m = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return Array.from({ length: CANTIDAD_MESES }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (CANTIDAD_MESES - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: m[d.getMonth()] };
  });
}
export type ResumenComunidad = { id: Id | 'SIN_ASIGNAR'; nombre: string; ninos: number; familias: number };
export type PendienteSeguimiento = { nino: NinoDashboard; ultimaFecha: string | null };

export function calcularDashboard(data: Partial<DashboardDatos>, now = new Date()) {
  const hoy = fechaLocal(now);
  const mesActual = hoy.slice(0, 7);
  const desde90 = sumarDias(hoy, -90);
  const desde30 = sumarDias(hoy, -30);
  const hasta30 = sumarDias(hoy, 30);
  const ninos = data.ninos ?? [];
  const controles = data.crecimiento ?? [];
  const vacunas = data.vacunaciones ?? [];
  const alertas = data.alertas ?? [];
  const familias = data.familias ?? [];
  const comunidades = data.comunidades ?? [];
  const campanias = data.campanias ?? [];
  const notificaciones = data.notificaciones ?? [];

  const nombres = new Map(ninos.map((n) => [String(n.id_nino), n]));
  const famMap = new Map(familias.map((f) => [String(f.id_familia), f]));
  const comunMap = new Map(comunidades.map((c) => [String(c.id_comunidad), c]));
  const ultimoControl = new Map<string, ControlDashboard>();
  controles.forEach((r) => {
    const fecha = diaValido(r.fecha_medicion);
    if (!fecha) return;
    const k = String(r.id_nino);
    const anterior = ultimoControl.get(k);
    if (!anterior || fecha > (diaValido(anterior.fecha_medicion) ?? '')) ultimoControl.set(k, r);
  });
  const activos = ninos.filter((n) => n.activo === true);
  const gruposEdad = [
    { etiqueta: 'Menores de 1 año', minimo: 0, maximo: 11 },
    { etiqueta: 'De 1 a menos de 2 años', minimo: 12, maximo: 23 },
    { etiqueta: 'De 2 a menos de 5 años', minimo: 24, maximo: 59 },
    { etiqueta: '5 años o más', minimo: 60, maximo: Infinity },
  ].map((grupo) => ({
    ...grupo,
    total: activos.filter((n) => {
      const edad = mesesEdad(n.fecha_nacimiento, hoy);
      return edad !== null && edad >= grupo.minimo && edad <= grupo.maximo;
    }).length,
  }));
  const sinControl90: PendienteSeguimiento[] = data.ninos && data.crecimiento
    ? activos.map((n) => ({ nino: n, ultimaFecha: diaValido(ultimoControl.get(String(n.id_nino))?.fecha_medicion) }))
        .filter(({ ultimaFecha }) => !ultimaFecha || ultimaFecha < desde90)
        .sort((a, b) => (a.ultimaFecha ?? '').localeCompare(b.ultimaFecha ?? ''))
    : [];

  const comunidadConteos = new Map<string, ResumenComunidad>();
  comunidades.forEach((c) => comunidadConteos.set(String(c.id_comunidad), {
    id: c.id_comunidad, nombre: c.nombre, ninos: 0, familias: 0,
  }));
  familias.forEach((f) => {
    const row = comunidadConteos.get(String(f.id_comunidad));
    if (row) row.familias++;
  });
  activos.forEach((n) => {
    const familia = famMap.get(String(n.id_familia));
    const idCom = n.familia?.id_comunidad ?? familia?.id_comunidad;
    if (idCom == null) return;
    const row = comunidadConteos.get(String(idCom));
    if (row) row.ninos++;
  });
  const comunidadesResumen = [...comunidadConteos.values()].sort((a,b) => b.ninos - a.ninos || a.nombre.localeCompare(b.nombre));

  const vacunacionPorEstado = {
    APLICADA: vacunas.filter(v => v.estado === 'APLICADA').length,
    PENDIENTE: vacunas.filter(v => v.estado === 'PENDIENTE').length,
    ATRASADA: vacunas.filter(v => v.estado === 'ATRASADA').length,
  };
  const totalDosis = Object.values(vacunacionPorEstado).reduce((a,b) => a+b, 0);
  const porcentajeAplicadas = totalDosis > 0
    ? Math.round((vacunacionPorEstado.APLICADA / totalDosis) * 1000) / 10
    : null;
  const dosisProximas = vacunas
    .filter(v => {
      const fecha = diaValido(v.fecha_programada);
      return v.estado === 'PENDIENTE' && !!fecha && fecha >= hoy && fecha <= hasta30;
    })
    .sort((a,b) => String(a.fecha_programada).localeCompare(String(b.fecha_programada)));
  const alertasAbiertas = alertas.filter(a => a.estado === 'PENDIENTE');
  const alertasCriticas = alertasAbiertas.filter(a => a.severidad === 'CRITICA');
  const alertasCrecimiento = alertasAbiertas.filter(a =>
    ['BAJO_PESO', 'SOBREPESO', 'TALLA_BAJA'].includes(a.tipo_alerta ?? '')
  );
  const alertasVacunacion = alertasAbiertas.filter(a => a.tipo_alerta === 'VACUNA_ATRASADA');
  const alertasPrioridad = [...alertasAbiertas].sort((a,b) =>
    Number(b.severidad === 'CRITICA') - Number(a.severidad === 'CRITICA') ||
    String(b.fecha_generacion).localeCompare(String(a.fecha_generacion))
  );
  const campaniasProximas = campanias.filter((c) =>
    c.estado === 'PROGRAMADA' || c.estado === 'EN_PROCESO'
  ).sort((a,b) => String(a.fecha_programada ?? '').localeCompare(String(b.fecha_programada ?? '')));
  const notificacionesPorEstado = {
    ENVIADA: notificaciones.filter(n => n.estado === 'ENVIADA').length,
    PENDIENTE: notificaciones.filter(n => n.estado === 'PENDIENTE').length,
    ERROR: notificaciones.filter(n => n.estado === 'ERROR').length,
  };
  const notificacionesPorCanal = ['EMAIL','WHATSAPP','TELEGRAM'].map((canal) => ({
    canal, total: notificaciones.filter(n => n.canal === canal).length,
  }));
  const meses = mesesUltimos12(now);
  const crecimientoMensual = meses.map(m => ({
    ...m, valor: controles.filter(r => diaValido(r.fecha_medicion)?.slice(0,7) === m.key).length,
  }));
  const vacunacionMensual = meses.map(m => ({
    ...m, valor: vacunas.filter(r => r.estado === 'APLICADA' && diaValido(r.fecha_aplicacion)?.slice(0,7) === m.key).length,
  }));
  const recientes = controles.filter(c => diaValido(c.fecha_medicion))
    .sort((a,b) => String(b.fecha_medicion).localeCompare(String(a.fecha_medicion)))
    .slice(0,8);

  return {
    hoy, mesActual,
    registrados: ninos.length, activos: activos.length,
    menoresDos: activos.filter(n => { const meses = mesesEdad(n.fecha_nacimiento, hoy); return meses != null && meses < 24; }).length,
    totalComunidades: comunidades.length,
    comunidadesActivas: comunidades.filter(c => c.activo).length,
    totalFamilias: familias.length,
    totalControles: controles.length,
    controlesMes: controles.filter(c => diaValido(c.fecha_medicion)?.slice(0,7) === mesActual).length,
    controles30: controles.filter(c => (diaValido(c.fecha_medicion) ?? '') >= desde30).length,
    ninosConControl: activos.filter(n => ultimoControl.has(String(n.id_nino))).length,
    sinControl90,
    vacunacionPorEstado, totalDosis, porcentajeAplicadas,
    dosisProximas, alertasAbiertas, alertasCriticas, alertasCrecimiento, alertasVacunacion, alertasPrioridad,
    campaniasProximas, notificacionesPorEstado, notificacionesPorCanal,
    crecimientoMensual, vacunacionMensual, recientes, gruposEdad,
    comunidadesResumen, nombres, comunMap,
  };
}
