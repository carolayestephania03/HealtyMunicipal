export type ControlCrecimientoPublico = {
  fecha_medicion: string | null;
  edad_meses: number | null;
  peso_kg: number | null;
  talla_cm: number | null;
  percentil_peso_edad: number | null;
  percentil_talla_edad: number | null;
  percentil_imc_edad: number | null;
};

export type VacunacionPublica = {
  vacuna: string;
  dosis: number | null;
  estado: 'APLICADA' | 'PENDIENTE' | 'ATRASADA' | string;
  fecha_programada: string | null;
  fecha_aplicacion: string | null;
};

export type ExpedientePublico = {
  carnet: {
    estado: 'ACTIVO';
    fecha_expiracion: string | null;
  };
  nino: {
    codigo_expediente: string;
    nombres: string;
    apellidos: string;
    sexo: 'M' | 'F';
    fecha_nacimiento: string;
  };
  crecimiento: ControlCrecimientoPublico[];
  vacunaciones: VacunacionPublica[];
};

type ApiResultado<T> = { success: boolean; message: string; data: T };
export type RespuestaExpediente = ApiResultado<ExpedientePublico>;
