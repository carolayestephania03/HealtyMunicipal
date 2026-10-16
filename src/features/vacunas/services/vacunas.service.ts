import { api } from '../../../services/api/api-client';
import type { ApiResponse, Vacuna, Id } from '../../vacunacion/types';

// Catálogo institucional existente: /api/vacunas
// La baja lógica actualiza 'activo'; NUNCA elimina físicamente una vacuna.
export type GuardarVacunaDto = { nombre: string; descripcion?: string | null };

const idSeguro = (id: Id) => encodeURIComponent(String(id));

export const vacunasService = {
  listar(signal?: AbortSignal): Promise<ApiResponse<Vacuna[]>> {
    // Se solicita incluir las inactivas para permitir la consulta del historial del catálogo.
    return api.get<ApiResponse<Vacuna[]>>('/api/vacunas?solo_activas=false', undefined, signal);
  },
  obtener(id: Id): Promise<ApiResponse<Vacuna>> {
    return api.get<ApiResponse<Vacuna>>(`/api/vacunas/${idSeguro(id)}`);
  },
  crear(datos: GuardarVacunaDto): Promise<ApiResponse<Vacuna>> {
    return api.post<ApiResponse<Vacuna>>('/api/vacunas', datos);
  },
  editar(id: Id, datos: GuardarVacunaDto): Promise<ApiResponse<Vacuna>> {
    return api.put<ApiResponse<Vacuna>>(`/api/vacunas/${idSeguro(id)}`, datos);
  },
  cambiarEstado(id: Id, activo: boolean): Promise<ApiResponse<Vacuna>> {
    return api.patch<ApiResponse<Vacuna>>(`/api/vacunas/${idSeguro(id)}/estado`, { activo });
  },
};
