export type Id = number | string;
export type SeveridadAlerta = 'CRITICA' | 'PREVENTIVA';
export type EstadoAlerta = 'PENDIENTE' | 'ATENDIDA' | 'DESCARTADA';

export type NinoAlerta = {
  id_nino: Id;
  codigo_expediente?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  fecha_nacimiento?: string | null;
  familia?: {
    id_familia?: Id;
    codigo_familia?: string | null;
    comunidad?: { id_comunidad?: Id; nombre?: string | null } | null;
  } | null;
};

export type Alerta = {
  id_alerta: Id;
  id_nino?: Id | null;
  id_registro_crecimiento?: Id | null;
  id_vacunacion_nino?: Id | null;
  tipo_alerta: string;
  severidad: SeveridadAlerta | string;
  titulo: string;
  mensaje?: string | null;
  estado: EstadoAlerta | string;
  fecha_generacion?: string | null;
  fecha_atencion?: string | null;
  observacion_atencion?: string | null;
  id_usuario_atencion?: Id | null;
  nino?: NinoAlerta | null;
  usuarioAtencion?: { nombres?: string | null; apellidos?: string | null } | null;
  registroCrecimiento?: { fecha_medicion?: string | null; peso_kg?: number | null; talla_cm?: number | null } | null;
  vacunacion?: { fecha_programada?: string | null; estado?: string | null } | null;
};

export type RespuestaApi<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type FiltroEstado = 'TODOS' | EstadoAlerta;
export type FiltroPeriodo = 'TODOS' | '7' | '30' | '90';
export type GrupoAlerta = 'CRITICA' | 'PREVENTIVA' | 'TODAS';
