export type Id = number | string;
export type Canal = 'EMAIL' | 'TELEGRAM';
export type Parentesco = 'MADRE' | 'PADRE' | 'TUTOR' | 'OTRO';

export type RelacionTutorNino = {
  id_tutor_nino: Id;
  parentesco: Parentesco;
  responsable_principal: boolean;
  autorizado_consulta_qr: boolean;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

export type NinoVinculado = {
  id_nino: Id;
  id_familia: Id;
  codigo_expediente: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  activo: boolean;
  familia?: {
    id_familia: Id;
    codigo_familia: string;
    comunidad?: {
      id_comunidad: Id;
      nombre: string;
      municipio?: string | null;
      departamento?: string | null;
    } | null;
  } | null;
  // Sequelize utiliza el nombre del modelo through; puede variar según la definición.
  TutorNino?: RelacionTutorNino;
  tutor_nino?: RelacionTutorNino;
};

export type TutorResumen = {
  id_tutor: Id;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  canal_preferido: Canal | null;
  telegram_chat_id?: string | null;
  activo: boolean;
  total_hijos?: number;
};

export type TutorPerfil = TutorResumen & {
  ninos: NinoVinculado[];
};

export type EditarTutorDto = {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  correo?: string | null;
  canal_preferido?: Canal | null;
};

export type RespuestaApi<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CrearTutorDto = {
  nombres: string;
  apellidos: string;
  dpi?: string;
  telefono?: string | null;
  correo?: string | null;
  canal_preferido?: Canal | null;
};

export type AsociarTutorNinoDto = {
  parentesco: Parentesco;
  responsable_principal: boolean;
  autorizado_consulta_qr: boolean;
  fecha_inicio?: string;
};

export type NinoBusqueda = Pick<NinoVinculado,
  'id_nino' | 'id_familia' | 'codigo_expediente' | 'nombres' |
  'apellidos' | 'fecha_nacimiento' | 'sexo' | 'activo'
>;

export type FiltroEstadoTabla = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
export type ConsultaTablaTutores = {
  q?: string;
  estado?: FiltroEstadoTabla;
  pagina?: number;
  limite?: number;
};
export type RespuestaTablaTutores = RespuestaApi<{
  registros: TutorResumen[];
  paginacion: { pagina: number; limite: number; total: number; totalPaginas: number };
  resumen: { total: number; activos: number; inactivos: number; conHijos: number };
}>;

// API Telegram: nunca exponer Chat ID completo ni el token del bot.
export type EstadoTelegramTutor = {
  id_tutor: Id; vinculado: boolean; canal_preferido: Canal | null;
  chat_id_mascara: string | null; solicitud_pendiente: boolean; expira_en: string | null;
};
export type EnlaceTelegramTutor = {
  id_tutor: Id; vinculado: boolean; url: string;
  expira_en: string; expira_en_minutos: number;
};
export type ResultadoPruebaTelegram = { enviado: boolean; messageId: string | null };
