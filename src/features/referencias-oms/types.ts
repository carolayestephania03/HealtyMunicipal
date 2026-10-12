export type IndicadorOms =
  | 'PESO_EDAD'
  | 'TALLA_EDAD'
  | 'IMC_EDAD';

export type SexoOms = 'M' | 'F';

export type ReferenciaOms = {
  id_referencia: number | string;
  sexo: SexoOms;
  indicador: IndicadorOms;
  edad_meses: number | string;

  parametro_l: number | string | null;
  parametro_m: number | string | null;
  parametro_s: number | string | null;

  version_referencia?: string | null;
};

export type RespuestaReferenciasOms = {
  success: boolean;
  message: string;
  data: ReferenciaOms[];
};