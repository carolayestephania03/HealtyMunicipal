import { api } from '../../../services/api/api-client';
import type {
  ApiResponse, Id, Vacunacion, RegistrarVacunacion, AplicarVacunacion, EditarVacunacion,
} from '../types';

const BASE = '/api/vacunaciones';
const esc = (id: Id) => encodeURIComponent(String(id));

export const vacunacionService = {
  listar(signal?: AbortSignal): Promise<ApiResponse<Vacunacion[]>> {
    return api.get<ApiResponse<Vacunacion[]>>(BASE, undefined, signal);
  },
  historial(idNino: Id, signal?: AbortSignal): Promise<ApiResponse<Vacunacion[]>> {
    return api.get<ApiResponse<Vacunacion[]>>(`${BASE}/nino/${esc(idNino)}`, undefined, signal);
  },
  obtener(id: Id): Promise<ApiResponse<Vacunacion>> {
    return api.get<ApiResponse<Vacunacion>>(`${BASE}/${esc(id)}`);
  },
  registrarPendiente(datos: RegistrarVacunacion): Promise<ApiResponse<Vacunacion>> {
    return api.post<ApiResponse<Vacunacion>>(BASE, datos);
  },
  aplicar(id: Id, datos: AplicarVacunacion): Promise<ApiResponse<Vacunacion>> {
    return api.patch<ApiResponse<Vacunacion>>(`${BASE}/${esc(id)}/aplicar`, datos);
  },
  actualizar(id: Id, datos: EditarVacunacion): Promise<ApiResponse<Vacunacion>> {
    return api.put<ApiResponse<Vacunacion>>(`${BASE}/${esc(id)}`, datos);
  },
};
