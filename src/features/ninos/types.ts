
export type NinoId = number | string;

export type Sexo = 'M' | 'F';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type FamiliaResumen = {
  id_familia: NinoId;
  codigo_familia: string;
  id_comunidad: NinoId;
};

export type ComunidadResumen = {
  id_comunidad: NinoId;
  nombre: string;
  municipio?: string | null;
  departamento?: string | null;
};

export type TutorResumen = {
  id_tutor: NinoId;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
  canal_preferido?: string | null;
  activo?: boolean;
};

export type FamiliaDetalle = FamiliaResumen & {
  comunidad?: ComunidadResumen | null;
};

export type Nino = {
  id_nino: NinoId;
  id_familia: NinoId;

  codigo_expediente: string;
  nombres: string;
  apellidos: string;

  fecha_nacimiento: string;
  sexo: Sexo;
  activo: boolean;

  familia?: FamiliaDetalle | null;
  tutores?: TutorResumen[];
};

export type CrearNinoDto = {
  id_familia: number;
  codigo_expediente: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: Sexo;
};

export type ActualizarNinoDto =
  Partial<CrearNinoDto>;

export type CambiarEstadoNinoDto = {
  activo: boolean;
};

export type NinoFiltrosApi = {
  id_familia?: number;
  solo_activos?: boolean;
};
