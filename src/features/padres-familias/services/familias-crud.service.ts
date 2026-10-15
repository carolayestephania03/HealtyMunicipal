import { api } from '../../../services/api/api-client';
import type { Id, RespuestaApi } from '../types';

export type ComunidadOpcion = {
  id_comunidad: Id;
  nombre: string;
  municipio?: string | null;
  departamento?: string | null;
};
export type FamiliaGestion = {
  id_familia: Id;
  id_comunidad: Id;
  codigo_familia: string;
  direccion: string | null;
  referencia: string | null;
  activo: boolean;
  comunidad?: ComunidadOpcion | null;
  ninos?: Array<{
    id_nino: Id; nombres: string; apellidos: string;
    codigo_expediente: string; fecha_nacimiento: string; activo: boolean;
  }>;
};
export type FamiliaDto = {
  id_comunidad: number;
  codigo_familia: string;
  direccion: string | null;
  referencia: string | null;
};
const BASE = '/api/familias';
const idPath = (id: Id) => encodeURIComponent(String(id));

export const familiasCrudService = {
  listar: () => api.get<RespuestaApi<FamiliaGestion[]>>(BASE),
  comunidades: () => api.get<RespuestaApi<ComunidadOpcion[]>>('/api/comunidades'),
  detalle: (id: Id) => api.get<RespuestaApi<FamiliaGestion>>(`${BASE}/${idPath(id)}`),
  crear: (datos: FamiliaDto) => api.post<RespuestaApi<FamiliaGestion>>(BASE, datos),
  editar: (id: Id, datos: FamiliaDto) => api.put<RespuestaApi<FamiliaGestion>>(`${BASE}/${idPath(id)}`, datos),
  estado: (id: Id, activo: boolean) => api.patch<RespuestaApi<FamiliaGestion>>(`${BASE}/${idPath(id)}/estado`, { activo }),
};
