
export type FamiliaId = number | string;

export type CentroSaludResumen = {
  id_centro: FamiliaId;
  codigo: string;
  nombre: string;
};

export type ComunidadFamilia = {
  id_comunidad: FamiliaId;
  nombre: string;
  municipio?: string | null;
  departamento?: string | null;
  centroSalud?: CentroSaludResumen | null;
};

export type Familia = {
  id_familia: FamiliaId;
  id_comunidad: FamiliaId;
  codigo_familia: string;

  direccion?: string | null;
  referencia?: string | null;

  activo?: boolean;

  comunidad?: ComunidadFamilia | null;
};

export type ApiFamiliasResponse = {
  success: boolean;
  message: string;
  data: Familia[];
};
