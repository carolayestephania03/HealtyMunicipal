import { api } from '../../../services/api/api-client';
import type { Id } from '../../vacunacion/types';
import type { EstadoCarnet, RespuestaCarnet, RespuestaCarnetEmitido } from '../types';

const BASE = '/api/carnets-digitales';
const esc = (id: Id) => encodeURIComponent(String(id));

type RespuestaCambioPin = {
  success: boolean;
  message: string;
  data: {
    id_carnet: Id;
    id_nino: Id;
    estado: EstadoCarnet;
    pin_configurado: boolean;
  };
};

export const carnetService = {
  obtenerPorNino(idNino: Id): Promise<RespuestaCarnet> {
    return api.get<RespuestaCarnet>(`${BASE}/nino/${esc(idNino)}`);
  },
  crear(idNino: Id, pin: string): Promise<RespuestaCarnetEmitido> {
    return api.post<RespuestaCarnetEmitido>(BASE, { id_nino: Number(idNino), pin });
  },
  cambiarEstado(id: Id, estado: EstadoCarnet): Promise<RespuestaCarnet> {
    return api.patch<RespuestaCarnet>(`${BASE}/${esc(id)}/estado`, { estado });
  },
  regenerar(id: Id): Promise<RespuestaCarnetEmitido> {
    return api.post<RespuestaCarnetEmitido>(`${BASE}/${esc(id)}/regenerar-token`, {});
  },
  cambiarPin(id: Id, nuevoPin: string): Promise<RespuestaCambioPin> {
    return api.patch<RespuestaCambioPin>(`${BASE}/${esc(id)}/pin`, { nuevo_pin: nuevoPin });
  },
};
