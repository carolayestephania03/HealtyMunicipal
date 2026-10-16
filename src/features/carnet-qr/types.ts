import type { Id, ApiResponse } from '../vacunacion/types';
export type EstadoCarnet = 'ACTIVO' | 'BLOQUEADO' | 'VENCIDO';
export type CarnetDigital = {
  id_carnet: Id;
  id_nino: Id;
  estado: EstadoCarnet;
  fecha_expiracion?: string | null;
  fecha_generacion?: string | null;
  ultimo_acceso?: string | null;
  ubicacion_qr?: string | null;
};
export type CarnetEmitido = { carnet: CarnetDigital; token: string };
export type RespuestaCarnet = ApiResponse<CarnetDigital>;
export type RespuestaCarnetEmitido = ApiResponse<CarnetEmitido>;
