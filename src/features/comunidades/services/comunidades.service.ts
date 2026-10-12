import { api } from '../../../services/api/api-client';
import type { Comunidad, ComunidadCrearDto, ComunidadEditarDto, Id, RespuestaApi } from '../types';

const BASE = '/api/comunidades';
const rutaId = (id: Id) => encodeURIComponent(String(id));

export const comunidadesService = {
  listar(signal?: AbortSignal): Promise<RespuestaApi<Comunidad[]>> {
    // Trae ambos estados; el filtro de estado y la búsqueda se realizan localmente.
    return api.get<RespuestaApi<Comunidad[]>>(BASE, undefined, signal);
  },
  obtenerPorId(id: Id): Promise<RespuestaApi<Comunidad>> {
    return api.get<RespuestaApi<Comunidad>>(`${BASE}/${rutaId(id)}`);
  },
  crear(datos: ComunidadCrearDto): Promise<RespuestaApi<Comunidad>> {
    return api.post<RespuestaApi<Comunidad>>(BASE, datos);
  },
  actualizar(id: Id, datos: ComunidadEditarDto): Promise<RespuestaApi<Comunidad>> {
    return api.put<RespuestaApi<Comunidad>>(`${BASE}/${rutaId(id)}`, datos);
  },
  cambiarEstado(id: Id, activo: boolean): Promise<RespuestaApi<Comunidad>> {
    return api.patch<RespuestaApi<Comunidad>>(`${BASE}/${rutaId(id)}/estado`, { activo });
  },
};
