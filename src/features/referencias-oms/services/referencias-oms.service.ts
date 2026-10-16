import {
  api,
} from '../../../services/api/api-client';

import {
  endpoints,
} from '../../../services/api/endpoints';

import type {
  IndicadorOms,
  SexoOms,
  RespuestaReferenciasOms,
} from '../types';

export const referenciasOmsService = {
  listar(
    sexo: SexoOms,
    indicador: IndicadorOms,
    signal?: AbortSignal
  ): Promise<RespuestaReferenciasOms> {
    const query =
      `sexo=${encodeURIComponent(sexo)}` +
      `&indicador=${encodeURIComponent(indicador)}`;

    return api.get(
      `${endpoints.referenciasOms}?${query}`,
      undefined,
      signal
    );
  },
};