
import { api } from '../../../services/api/api-client';

import { endpoints } from '../../../services/api/endpoints';

// ================================================
// SERVICIO DE NIÑOS
// ================================================

export const ninosService = {

  // Consultar todos los niños
  listar: (
    accessToken?: string,
    signal?: AbortSignal
  ): Promise<unknown> => {
    return api.get<unknown>(
      endpoints.ninos,
      accessToken,
      signal
    );
  },

  // Consultar un niño por ID
  obtenerPorId: (
    id: string | number,
    accessToken?: string
  ): Promise<unknown> => {
    return api.get<unknown>(
      `${endpoints.ninos}/${encodeURIComponent(String(id))}`,
      accessToken
    );
  },

  // Registrar un niño
  crear: (
    datos: unknown,
    accessToken?: string
  ): Promise<unknown> => {
    return api.post<unknown>(
      endpoints.ninos,
      datos,
      accessToken
    );
  },

  // Actualizar la información de un niño
  actualizar: (
    id: string | number,
    datos: unknown,
    accessToken?: string
  ): Promise<unknown> => {
    return api.put<unknown>(
      `${endpoints.ninos}/${encodeURIComponent(String(id))}`,
      datos,
      accessToken
    );
  },

};
