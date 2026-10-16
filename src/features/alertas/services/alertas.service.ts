import { api } from '../../../services/api/api-client';
import type { Alerta, RespuestaApi } from '../types';

const BASE = '/api/alertas';

/**
 * Módulo de SOLO CONSULTA.
 * No se invocan endpoints POST/PATCH/PUT de alertas o notificaciones.
 * Se consumen únicamente los registros que el backend autoriza al usuario.
 */
export const alertasService = {
  async listar(): Promise<Alerta[]> {
    const respuesta = await api.get<RespuestaApi<Alerta[] | { registros: Alerta[] }>>(BASE);

    if (!respuesta?.success) {
      throw new Error(respuesta?.message || 'No fue posible consultar las alertas.');
    }

    const data = respuesta.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.registros)) {
      return data.registros;
    }
    throw new Error('La API devolvió un formato de alertas no reconocido.');
  },
};
