import {
  api,
} from '../../../services/api/api-client';

import {
  endpoints,
} from '../../../services/api/endpoints';

import type {
  RegistroId,
  RegistroCrecimiento,
  CrearControlDto,
  ActualizarControlDto,
  RespuestaApi,
} from '../types';

const BASE = endpoints.crecimiento;

const rutaId = (id: RegistroId) =>
  encodeURIComponent(String(id));

export const crecimientoService = {

  historial(
    idNino: RegistroId,
    signal?: AbortSignal
  ): Promise<RespuestaApi<RegistroCrecimiento[]>> {
    return api.get(
      `${BASE}/nino/${rutaId(idNino)}`,
      undefined,
      signal
    );
  },

  listar(
    idNino?: RegistroId
  ): Promise<RespuestaApi<RegistroCrecimiento[]>> {
    const query =
      idNino !== undefined
        ? `?id_nino=${rutaId(idNino)}`
        : '';

    return api.get(`${BASE}${query}`);
  },

  obtenerPorId(
    id: RegistroId
  ): Promise<RespuestaApi<RegistroCrecimiento>> {
    return api.get(`${BASE}/${rutaId(id)}`);
  },

  registrar(
    datos: CrearControlDto
  ): Promise<RespuestaApi<RegistroCrecimiento>> {
    return api.post(BASE, datos);
  },

  actualizar(
    id: RegistroId,
    datos: ActualizarControlDto
  ): Promise<RespuestaApi<RegistroCrecimiento>> {
    return api.put(
      `${BASE}/${rutaId(id)}`,
      datos
    );
  },
};