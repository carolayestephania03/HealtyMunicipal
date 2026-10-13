export type TipoReporte =
  | 'RESUMEN' | 'VACUNACION' | 'DOSIS_PENDIENTES' | 'CRECIMIENTO'
  | 'SEGUIMIENTO' | 'ALERTAS' | 'COMUNIDADES' | 'CAMPANIAS' | 'NOTIFICACIONES';

export type CategoriaReporte = 'GENERAL' | 'VACUNACION' | 'CRECIMIENTO' | 'SEGUIMIENTO' | 'GESTION';
export type ReporteCatalogo = {
  id: TipoReporte;
  titulo: string;
  categoria: CategoriaReporte;
  descripcion: string;
  usaPeriodo: boolean;
};
export type CentroReporte = { id_centro: number; codigo: string; nombre: string; activo: boolean };
export type ComunidadReporte = { id_comunidad: number; id_centro: number; nombre: string; municipio?: string | null; activo: boolean };
export type CatalogoReportes = {
  reportes: ReporteCatalogo[];
  centros: CentroReporte[];
  comunidades: ComunidadReporte[];
  es_global: boolean;
  centro_asignado: number | null;
};
export type GenerarReporteDto = {
  tipo: TipoReporte;
  desde: string;
  hasta: string;
  id_centro: number | null;
  id_comunidad: number | null;
};
export type PdfGenerado = {
  nombre_archivo: string;
  contenido_base64: string;
  mime_type: string;
  filas: number;
  recortado: boolean;
};
export type RespuestaApi<T> = { success: boolean; message?: string; data: T };
