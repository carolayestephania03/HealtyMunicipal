export type Id = string | number;
export type Canal = 'EMAIL' | 'TELEGRAM';
export type EstadoCampania = 'BORRADOR'|'PROGRAMADA'|'EN_PROCESO'|'FINALIZADA'|'CANCELADA';
export type EstadoNotificacion = 'PENDIENTE'|'ENVIADA'|'ERROR';
export type EstadoVacunacion = 'PENDIENTE'|'APLICADA'|'ATRASADA';
export type RespuestaApi<T> = { success:boolean; message?:string; data:T; total?:number };
export type Centro = {id_centro:Id;codigo:string;nombre:string;activo?:boolean};
export type Comunidad = {id_comunidad:Id;id_centro:Id;nombre:string;municipio?:string|null;activo?:boolean};
export type Perfil = {id_centro:Id|null;roles?:{nombre:string;activo:boolean}[];centroSalud?:Centro|null};
export type Campania = {
 id_campania:Id;id_centro:Id;id_comunidad:Id|null;titulo:string;mensaje:string;canal:Canal;
 edad_minima_meses:number|null;edad_maxima_meses:number|null;
 estado_vacunacion_objetivo:EstadoVacunacion|null;fecha_programada:string|null;
 estado:EstadoCampania;fecha_creacion?:string;fecha_finalizacion?:string|null;
 centroSalud?:Centro|null;comunidad?:Comunidad|null;
 usuarioCreador?:{nombres:string;apellidos:string}|null;
};
export type CampaniaDto = {
 id_centro:number;id_comunidad:number|null;titulo:string;mensaje:string;canal:Canal;
 edad_minima_meses:number|null;edad_maxima_meses:number|null;
 estado_vacunacion_objetivo:EstadoVacunacion|null;fecha_programada:string|null;
};
export type Notificacion = {
 id_notificacion:Id;id_campania:Id|null;id_tutor:Id;id_nino:Id|null;
 canal:Canal;asunto:string|null;mensaje:string;estado:EstadoNotificacion;
 numero_intentos:number;fecha_creacion?:string;fecha_envio?:string|null;detalle_error?:string|null;
 destinatario?:string;campania?:{id_campania:Id;titulo:string;estado:EstadoCampania}|null;
 tutor?:{nombres:string;apellidos:string}|null;
 nino?:{id_nino:Id;codigo_expediente:string;nombres:string;apellidos:string}|null;
};
export type Objetivo = {id_nino:Id;expediente?:string;nino:string;edad_meses:number;tutor:string|null;tiene_destinatario:boolean};
export type ResumenGeneracion = {id_campania:Id;poblacion_objetivo:number;notificaciones_creadas:number;notificaciones_omitidas:number};
export type LoteEnvio = {procesadas:number;enviadas:number;fallidas:number;pendientes_sin_enviar:number;errores:{id_notificacion:Id;detalle:string}[];mensaje:string};

export type CatalogosComunicacion={es_global:boolean;puede_gestionar:boolean;id_centro:Id|null;centros:Centro[];comunidades:Comunidad[]};
