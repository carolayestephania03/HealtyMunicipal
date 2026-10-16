import { api } from '../../../services/api/api-client';
import type {
  AlertaDashboard, CampaniaDashboard, ComunidadDashboard, ControlDashboard,
  DashboardDatos, DashboardEstado, DashboardFuente, FamiliaDashboard,
  NinoDashboard, NotificacionDashboard, RespuestaApi, VacunacionDashboard,
} from '../types';

// Se usan las rutas reales confirmadas en app.js; evita depender de endpoints.ts
// si este archivo fue modificado durante la integración de otros módulos.
async function consultar<T>(ruta: string, signal?: AbortSignal): Promise<T[]> {
  const respuesta = await api.get<RespuestaApi<T[]>>(ruta, undefined, signal);
  if (respuesta?.success !== true || !Array.isArray(respuesta.data)) {
    throw new Error(`La API no devolvió un listado válido en ${ruta}.`);
  }
  return respuesta.data;
}

const fuentes: {
  key: DashboardFuente;
  url: string;
  consultar: (signal?: AbortSignal) => Promise<unknown[]>;
}[] = [
  { key: 'ninos', url: '/api/ninos', consultar: (s) => consultar<NinoDashboard>('/api/ninos', s) },
  { key: 'comunidades', url: '/api/comunidades', consultar: (s) => consultar<ComunidadDashboard>('/api/comunidades', s) },
  { key: 'familias', url: '/api/familias', consultar: (s) => consultar<FamiliaDashboard>('/api/familias', s) },
  { key: 'crecimiento', url: '/api/crecimiento', consultar: (s) => consultar<ControlDashboard>('/api/crecimiento', s) },
  { key: 'vacunaciones', url: '/api/vacunaciones', consultar: (s) => consultar<VacunacionDashboard>('/api/vacunaciones', s) },
  { key: 'alertas', url: '/api/alertas', consultar: (s) => consultar<AlertaDashboard>('/api/alertas', s) },
  { key: 'campanias', url: '/api/campanias', consultar: (s) => consultar<CampaniaDashboard>('/api/campanias', s) },
  { key: 'notificaciones', url: '/api/notificaciones', consultar: (s) => consultar<NotificacionDashboard>('/api/notificaciones', s) },
];

export const dashboardService = {
  async obtener(signal?: AbortSignal): Promise<DashboardEstado> {
    // Fallos parciales: no convertir HTTP 403/404 ni errores de conexión en ceros.
    const resultados = await Promise.allSettled(
      fuentes.map((fuente) => fuente.consultar(signal))
    );
    const datos: Partial<DashboardDatos> = {};
    const errores: DashboardEstado['errores'] = {};

    resultados.forEach((resultado, indice) => {
      const { key } = fuentes[indice];
      if (resultado.status === 'fulfilled') {
        // Asignación indexada válida; la forma real se verificó en consultar().
        (datos as Record<string, unknown>)[key] = resultado.value;
      } else {
        errores[key] = resultado.reason instanceof Error
          ? resultado.reason.message
          : 'No fue posible consultar esta fuente.';
      }
    });

    return { datos, errores };
  },
};
