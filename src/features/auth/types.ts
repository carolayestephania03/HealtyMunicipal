
export type UsuarioAutenticado = {
  id_usuario: number;
  id_centro: number | null;

  nombres: string;
  apellidos: string;

  nombre_usuario: string;
  correo: string | null;

  roles: string[];

  centro_salud: Record<string, unknown> | null;
};

// Estructura original enviada por Express.
// PostgreSQL / Sequelize puede devolver
// algunos identificadores como cadenas.

export type UsuarioApiResponse = Omit<
  UsuarioAutenticado,
  'id_usuario' | 'id_centro'
> & {
  id_usuario: string | number;
  id_centro: string | number | null;
};

export type LoginCredentials = {
  identificador: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;

  data: {
    token: string;
    usuario: UsuarioApiResponse;
  };
};

export type AuthSession = {
  token: string;
  usuario: UsuarioAutenticado;
};
