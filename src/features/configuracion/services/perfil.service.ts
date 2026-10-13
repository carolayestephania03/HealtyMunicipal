import { api } from '../../../services/api/api-client';
import type { CambiarMiPasswordDto, EditarMiPerfilDto, PerfilUsuario, RespuestaApi } from '../types';

const BASE = '/api/usuarios/mi-perfil';

export const perfilService = {
  obtener(): Promise<RespuestaApi<PerfilUsuario>> {
    return api.get<RespuestaApi<PerfilUsuario>>(BASE);
  },
  actualizar(dto: EditarMiPerfilDto): Promise<RespuestaApi<PerfilUsuario>> {
    return api.put<RespuestaApi<PerfilUsuario>>(BASE, dto);
  },
  cambiarPassword(dto: CambiarMiPasswordDto): Promise<RespuestaApi<{ actualizada: boolean }>> {
    return api.put<RespuestaApi<{ actualizada: boolean }>>(`${BASE}/password`, dto);
  },
};
