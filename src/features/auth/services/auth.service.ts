
import {
  apiRequest,
} from '../../../services/api/api-client';

import {
  endpoints,
} from '../../../services/api/endpoints';

import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
  UsuarioAutenticado,
} from '../types';

// ======================================================
// SERVICIO DE AUTENTICACIÓN SCCVI
// ======================================================

export const authService = {

  async login(
    credentials: LoginCredentials
  ): Promise<AuthSession> {

    // ==================================================
    // ENVIAR CREDENCIALES A EXPRESS
    // ==================================================

    const respuesta = await apiRequest<LoginResponse>(
      endpoints.auth.login,
      {
        method: 'POST',

        body: JSON.stringify({
          identificador:
            credentials.identificador.trim(),

          password:
            credentials.password,
        }),

        skipAuth: true,
      }
    );

    // ==================================================
    // VALIDAR RESPUESTA
    // ==================================================

    if (
      !respuesta ||
      respuesta.success !== true ||
      !respuesta.data ||
      typeof respuesta.data.token !== 'string' ||
      !respuesta.data.token.trim() ||
      !respuesta.data.usuario
    ) {
      throw new Error(
        'La API devolvió una respuesta de autenticación inválida.'
      );
    }

    const usuarioApi = respuesta.data.usuario;

    // ==================================================
    // NORMALIZAR IDENTIFICADORES
    // ==================================================

    const idUsuario = Number(
      usuarioApi.id_usuario
    );

    const idCentro =
      usuarioApi.id_centro == null
        ? null
        : Number(usuarioApi.id_centro);

    // ==================================================
    // VALIDAR IDENTIFICADORES
    // ==================================================

    if (
      !Number.isSafeInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      throw new Error(
        'El identificador del usuario no es válido.'
      );
    }

    if (
      idCentro !== null &&
      (
        !Number.isSafeInteger(idCentro) ||
        idCentro <= 0
      )
    ) {
      throw new Error(
        'El identificador del centro de salud no es válido.'
      );
    }

    // ==================================================
    // VALIDAR ROLES
    // ==================================================

    if (
      !Array.isArray(usuarioApi.roles) ||
      usuarioApi.roles.length === 0 ||
      !usuarioApi.roles.every(
        (rol) => typeof rol === 'string' && rol.length > 0
      )
    ) {
      throw new Error(
        'El usuario no posee roles válidos.'
      );
    }

    // ==================================================
    // NORMALIZAR OBJETO DEL USUARIO
    // ==================================================

    const usuario: UsuarioAutenticado = {
      ...usuarioApi,

      id_usuario: idUsuario,

      id_centro: idCentro,
    };

    // ==================================================
    // DEVOLVER SESIÓN
    // ==================================================

    return {
      token: respuesta.data.token,
      usuario,
    };
  },
};
