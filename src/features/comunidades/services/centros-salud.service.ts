import { api } from '../../../services/api/api-client';
import type { CentroSalud, FamiliaComunidad, NinoFamilia, Id, RespuestaApi } from '../types';

// Catálogos del backend que ya utiliza SCCVI.
// El contrato GET /api/centros-salud se debe verificar con centroSalud.routes.js.
export const centrosSaludService = {
  listar(signal?: AbortSignal): Promise<RespuestaApi<CentroSalud[]>> {
    return api.get<RespuestaApi<CentroSalud[]>>('/api/centros-salud', undefined, signal);
  },
};

export const comunidadRelacionesService = {
  familias(idComunidad: Id): Promise<RespuestaApi<FamiliaComunidad[]>> {
    const query = encodeURIComponent(String(idComunidad));
    return api.get<RespuestaApi<FamiliaComunidad[]>>(`/api/familias?id_comunidad=${query}`);
  },
  ninosDeFamilia(idFamilia: Id): Promise<RespuestaApi<NinoFamilia[]>> {
    const id = encodeURIComponent(String(idFamilia));
    return api.get<RespuestaApi<NinoFamilia[]>>(`/api/ninos/familia/${id}`);
  },
};
