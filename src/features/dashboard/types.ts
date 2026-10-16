// Tipos mínimos para el Dashboard. No contienen DPI, hashes, JWT ni expedientes completos.
export type Id = number | string;
export type EstadoVacuna = 'APLICADA' | 'PENDIENTE' | 'ATRASADA';
export type RespuestaApi<T> = { success: boolean; message?: string; data: T };

export type NinoDashboard = {
  id_nino: Id;
  codigo_expediente: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  activo: boolean;
  id_familia: Id;
  familia?: { id_familia: Id; id_comunidad: Id; codigo_familia?: string } | null;
};
export type ComunidadDashboard = {
  id_comunidad: Id;
  nombre: string;
  id_centro: Id;
  municipio?: string | null;
  activo: boolean;
  centroSalud?: { nombre: string; id_centro: Id } | null;
};
export type FamiliaDashboard = {
  id_familia: Id;
  id_comunidad: Id;
  activo?: boolean;
};
export type ControlDashboard = {
  id_registro: Id;
  id_nino: Id;
  fecha_medicion: string;
  peso_kg: number | string;
  talla_cm: number | string;
};
export type VacunacionDashboard = {
  id_vacunacion_nino: Id;
  id_nino: Id;
  estado: EstadoVacuna;
  fecha_programada: string | null;
  fecha_aplicacion: string | null;
  esquema?: { numero_dosis: number | string; vacuna?: { nombre: string } | null } | null;
};
export type AlertaDashboard = {
  id_alerta: Id;
  id_nino?: Id | null;
  titulo: string;
  tipo_alerta?: string;
  severidad: 'CRITICA' | 'PREVENTIVA' | string;
  estado: string;
  fecha_generacion: string;
};
export type CampaniaDashboard = {
  id_campania: Id;
  titulo: string;
  estado: string;
  canal?: string;
  fecha_programada?: string | null;
  id_comunidad?: Id | null;
};
export type NotificacionDashboard = {
  id_notificacion: Id;
  estado: string;
  canal: string;
  fecha_creacion?: string | null;
};

export type DashboardDatos = {
  ninos: NinoDashboard[];
  comunidades: ComunidadDashboard[];
  familias: FamiliaDashboard[];
  crecimiento: ControlDashboard[];
  vacunaciones: VacunacionDashboard[];
  alertas: AlertaDashboard[];
  campanias: CampaniaDashboard[];
  notificaciones: NotificacionDashboard[];
};
export type DashboardFuente = keyof DashboardDatos;
export type DashboardEstado = {
  datos: Partial<DashboardDatos>;
  errores: Partial<Record<DashboardFuente, string>>;
};
