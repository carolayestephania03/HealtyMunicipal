// Contratos del módulo Comunidades - API SCCVI
export type Id = number | string;

export type RespuestaApi<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CentroSalud = {
  id_centro: Id;
  codigo: string;
  nombre: string;
  activo?: boolean;
};

export type Comunidad = {
  id_comunidad: Id;
  id_centro: Id;
  nombre: string;
  ubicacion: string | null;
  municipio: string | null;
  departamento: string | null;
  numero_familias_estimadas: number | string | null;
  activo: boolean;
  centroSalud?: CentroSalud | null;
};

export type ComunidadCrearDto = {
  id_centro: number;
  nombre: string;
  ubicacion?: string | null;
  municipio?: string | null;
  departamento?: string | null;
  numero_familias_estimadas?: number | null;
};

export type ComunidadEditarDto = Partial<ComunidadCrearDto>;

export type FamiliaComunidad = {
  id_familia: Id;
  id_comunidad: Id;
  codigo_familia: string;
  direccion?: string | null;
  activo?: boolean;
};

export type NinoFamilia = {
  id_nino: Id;
  codigo_expediente: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
};
