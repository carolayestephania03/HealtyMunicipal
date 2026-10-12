import { api } from '../../../services/api/api-client';
import type { ApiResponse, Vacuna, Id } from '../../vacunacion/types';

export const vacunasService = {
  listar(signal?: AbortSignal): Promise<ApiResponse<Vacuna[]>> {
    return api.get<ApiResponse<Vacuna[]>>('/api/vacunas', undefined, signal);
  },
  obtener(id: Id): Promise<ApiResponse<Vacuna>> {
    return api.get<ApiResponse<Vacuna>>(`/api/vacunas/${encodeURIComponent(String(id))}`);
  },
};
