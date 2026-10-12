
import {
  api,
} from '../../../services/api/api-client';

import {
  endpoints,
} from '../../../services/api/endpoints';

import type {
  ApiResponse,
  Nino,
  NinoId,
  NinoFiltrosApi,
  CrearNinoDto,
  ActualizarNinoDto,
} from '../types';

// ==========================================
// RUTA BASE
// ==========================================

const BASE = endpoints.ninos;

const idPath = (id: NinoId): string =>
  encodeURIComponent(String(id));

// ==========================================
// SERVICIOS DEL MÓDULO
// ==========================================

export const ninosService = {

  // ----------------------------------------
  // LISTAR NIÑOS
  // ----------------------------------------

  async listar(
    filtros: NinoFiltrosApi = {},
    signal?: AbortSignal
  ): Promise<ApiResponse<Nino[]>> {

    const params = new URLSearchParams();

    if (filtros.id_familia !== undefined) {
      params.set(
        'id_familia',
        String(filtros.id_familia)
      );
    }

    if (filtros.solo_activos !== undefined) {
      params.set(
        'solo_activos',
        String(filtros.solo_activos)
      );
    }

    const query = params.toString();

    const url = query
      ? `${BASE}?${query}`
      : BASE;

    // El JWT se agrega automáticamente
    // mediante api-client.ts.

    return api.get<ApiResponse<Nino[]>>(
      url,
      undefined,
      signal
    );
  },

  // ----------------------------------------
  // OBTENER NIÑO POR ID
  // ----------------------------------------

  obtenerPorId(
    id: NinoId
  ): Promise<ApiResponse<Nino>> {

    return api.get<ApiResponse<Nino>>(
      `${BASE}/${idPath(id)}`
    );
  },

  // ----------------------------------------
  // REGISTRAR NIÑO
  // ----------------------------------------

  crear(
    datos: CrearNinoDto
  ): Promise<ApiResponse<Nino>> {

    return api.post<ApiResponse<Nino>>(
      BASE,
      datos
    );
  },

  // ----------------------------------------
  // ACTUALIZAR NIÑO
  // ----------------------------------------

  actualizar(
    id: NinoId,
    datos: ActualizarNinoDto
  ): Promise<ApiResponse<Nino>> {

    return api.put<ApiResponse<Nino>>(
      `${BASE}/${idPath(id)}`,
      datos
    );
  },

  // ----------------------------------------
  // CAMBIAR ESTADO
  // ----------------------------------------

  cambiarEstado(
    id: NinoId,
    activo: boolean
  ): Promise<
    ApiResponse<{
      id_nino: NinoId;
      activo: boolean;
    }>
  > {

    return api.patch(
      `${BASE}/${idPath(id)}/estado`,
      { activo }
    );
  },

  // ----------------------------------------
  // CONSULTAR NIÑOS POR FAMILIA
  // ----------------------------------------

  listarPorFamilia(
    idFamilia: NinoId
  ): Promise<ApiResponse<Nino[]>> {

    return api.get<ApiResponse<Nino[]>>(
      `${BASE}/familia/${idPath(idFamilia)}`
    );
  },
};
