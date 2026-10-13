import { api } from '../../../services/api/api-client';
import type { Id, RespuestaApi, Rol, CrearRolDto, EditarRolDto } from '../types';
const BASE = '/api/roles';
const idRuta = (id: Id) => encodeURIComponent(String(id));
export const rolesService = {
  listar(): Promise<RespuestaApi<Rol[]>> { return api.get<RespuestaApi<Rol[]>>(BASE); },
  detalle(id: Id): Promise<RespuestaApi<Rol>> { return api.get<RespuestaApi<Rol>>(`${BASE}/${idRuta(id)}`); },
  usuarios(id: Id): Promise<RespuestaApi<Rol>> { return api.get<RespuestaApi<Rol>>(`${BASE}/${idRuta(id)}/usuarios`); },
  crear(dto: CrearRolDto): Promise<RespuestaApi<Rol>> { return api.post<RespuestaApi<Rol>>(BASE, dto); },
  editar(id: Id, dto: EditarRolDto): Promise<RespuestaApi<Rol>> { return api.put<RespuestaApi<Rol>>(`${BASE}/${idRuta(id)}`, dto); },
  cambiarEstado(id: Id, activo: boolean): Promise<RespuestaApi<Rol>> { return api.patch<RespuestaApi<Rol>>(`${BASE}/${idRuta(id)}/estado`, { activo }); },
};
