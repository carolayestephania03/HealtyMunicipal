export type Id = number | string;
export type RespuestaApi<T> = { success: boolean; message?: string; data: T };

export type RolPerfil = {
  id_rol: Id;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

export type CentroPerfil = {
  id_centro: Id;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type PerfilUsuario = {
  id_usuario: Id;
  id_centro: Id | null;
  nombres: string;
  apellidos: string;
  nombre_usuario: string;
  correo: string;
  activo: boolean;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  centroSalud?: CentroPerfil | null;
  roles?: RolPerfil[];
};

// Ningún DTO permite cambiar roles, id_centro, id_usuario o activo.
export type EditarMiPerfilDto = {
  nombres: string;
  apellidos: string;
  nombre_usuario: string;
  correo: string;
};
export type CambiarMiPasswordDto = {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
};
