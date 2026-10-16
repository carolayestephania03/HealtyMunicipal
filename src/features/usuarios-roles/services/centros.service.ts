import { api } from '../../../services/api/api-client';
import type { CentroSalud, RespuestaApi } from '../types';
export const centrosUsuariosService = {
  listar(): Promise<RespuestaApi<CentroSalud[]>> {
    return api.get<RespuestaApi<CentroSalud[]>>('/api/centros-salud');
  },
};
