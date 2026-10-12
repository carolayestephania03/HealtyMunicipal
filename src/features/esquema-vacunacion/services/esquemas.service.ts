import { api } from '../../../services/api/api-client';
import type { ApiResponse, Esquema, Id } from '../../vacunacion/types';

export const esquemasService = {
  listar(signal?: AbortSignal): Promise<ApiResponse<Esquema[]>> {
    return api.get<ApiResponse<Esquema[]>>('/api/esquemas-vacunacion', undefined, signal);
  },
  porVacuna(idVacuna: Id): Promise<ApiResponse<Esquema[]>> {
    return api.get<ApiResponse<Esquema[]>>(`/api/esquemas-vacunacion/vacuna/${encodeURIComponent(String(idVacuna))}`);
  },
};
