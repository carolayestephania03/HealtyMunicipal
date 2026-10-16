import { api } from '../../../services/api/api-client';
import type { Id, RespuestaApi, Usuario, CrearUsuarioDto, EditarUsuarioDto, ReemplazarRolesDto } from '../types';
const BASE = '/api/usuarios';
const idRuta = (id: Id) => encodeURIComponent(String(id));
export const usuariosService = {
  listar(): Promise<RespuestaApi<Usuario[]>> { return api.get<RespuestaApi<Usuario[]>>(BASE); },
  detalle(id: Id): Promise<RespuestaApi<Usuario>> { return api.get<RespuestaApi<Usuario>>(`${BASE}/${idRuta(id)}`); },
  crear(dto: CrearUsuarioDto): Promise<RespuestaApi<Usuario>> { return api.post<RespuestaApi<Usuario>>(BASE, dto); },
  editar(id: Id, dto: EditarUsuarioDto): Promise<RespuestaApi<Usuario>> { return api.put<RespuestaApi<Usuario>>(`${BASE}/${idRuta(id)}`, dto); },
  cambiarEstado(id: Id, activo: boolean): Promise<RespuestaApi<Usuario>> { return api.patch<RespuestaApi<Usuario>>(`${BASE}/${idRuta(id)}/estado`, { activo }); },
  reemplazarRoles(id: Id, roles: number[]): Promise<RespuestaApi<Usuario>> {
    const dto: ReemplazarRolesDto = { roles };
    return api.put<RespuestaApi<Usuario>>(`${BASE}/${idRuta(id)}/roles`, dto);
  },
};
