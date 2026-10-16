export type Id = number | string;
export type EstadoVacunacion = 'PENDIENTE' | 'APLICADA' | 'ATRASADA';
export type ApiResponse<T> = { success: boolean; message: string; data: T };

export type Vacuna = {
  id_vacuna: Id;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type Esquema = {
  id_esquema: Id;
  id_vacuna: Id;
  numero_dosis: number | string;
  edad_recomendada_meses: number | string;
  intervalo_dias_dosis_anterior?: number | string | null;
  descripcion?: string | null;
  activo?: boolean;
  vacuna?: Vacuna | null;
};

export type Vacunacion = {
  id_vacunacion_nino: Id;
  id_nino: Id;
  id_esquema: Id;
  estado: EstadoVacunacion;
  fecha_programada: string | null;
  fecha_aplicacion: string | null;
  proxima_dosis?: string | null;
  lote_vacuna?: string | null;
  observaciones?: string | null;
  id_centro?: Id | null;
  esquema?: Esquema | null;
  nino?: {
    id_nino: Id; nombres: string; apellidos: string; codigo_expediente: string;
    fecha_nacimiento?: string;
  } | null;
  centroSalud?: { id_centro: Id; nombre: string } | null;
  usuarioAplicacion?: { id_usuario: Id; nombres: string; apellidos: string } | null;
};

export type RegistrarVacunacion = {
  id_nino: number;
  id_esquema: number;
  estado: 'PENDIENTE';
  fecha_programada?: string | null;
  observaciones?: string | null;
};
export type AplicarVacunacion = {
  fecha_aplicacion: string;
  lote?: string | null;
  observaciones?: string | null;
};
export type EditarVacunacion = {
  fecha_programada?: string | null;
  estado?: 'PENDIENTE' | 'ATRASADA';
  lote?: string | null;
  observaciones?: string | null;
};

export function fechaSoloDia(valor: string | null | undefined): string {
  return valor ? String(valor).slice(0, 10) : '—';
}

export function hoyLocal(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export function esFechaReal(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const f = new Date(Date.UTC(anio, mes - 1, dia));
  return f.getUTCFullYear() === anio && f.getUTCMonth() === mes - 1 && f.getUTCDate() === dia;
}
