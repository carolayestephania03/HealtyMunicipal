export type Id = number | string;
export type RespuestaApi<T> = { success: boolean; message?: string; data: T };

export interface CentroSalud {
  id_centro: Id;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Rol {
  id_rol: Id;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  usuarios?: Usuario[];
}

export interface Usuario {
  id_usuario: Id;
  id_centro: Id | null;
  nombres: string;
  apellidos: string;
  nombre_usuario: string;
  correo: string;
  activo: boolean;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  centroSalud?: CentroSalud | null;
  roles: Rol[];
}

export type CrearUsuarioDto = {
  id_centro: number | null;
  nombres: string;
  apellidos: string;
  nombre_usuario: string;
  correo: string;
  password: string;
  roles: number[];
};
export type EditarUsuarioDto = Partial<Omit<CrearUsuarioDto, 'password' | 'roles'>>;
export type ReemplazarRolesDto = { roles: number[] };
export type CrearRolDto = { nombre: string; descripcion?: string | null };
export type EditarRolDto = Partial<CrearRolDto>;
