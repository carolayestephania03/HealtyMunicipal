
import {
  api,
} from '../../../services/api/api-client';

import {
  endpoints,
} from '../../../services/api/endpoints';

import type {
  Familia,
  FamiliaId,
  ApiFamiliasResponse,
} from '../types';

type ApiFamiliaResponse = {
  success: boolean;
  message: string;
  data: Familia;
};

export const familiasService = {

  // Consultar familias
  listar(
    signal?: AbortSignal
  ): Promise<ApiFamiliasResponse> {
    return api.get<ApiFamiliasResponse>(
      endpoints.familias,
      undefined,
      signal
    );
  },

  // Obtener familia por ID
  obtenerPorId(
    id: FamiliaId
  ): Promise<ApiFamiliaResponse> {
    return api.get<ApiFamiliaResponse>(
      `${endpoints.familias}/${encodeURIComponent(String(id))}`
    );
  },

};
