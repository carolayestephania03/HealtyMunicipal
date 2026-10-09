
import type {
  AuthSession,
} from '../../features/auth/types';

// ======================================================
// ALMACENAMIENTO DE SESIÓN - WEB
// ======================================================

// La sesión se mantiene únicamente en memoria.
// Al recargar el navegador será necesario
// iniciar sesión nuevamente.

let currentSession: AuthSession | null = null;

// ======================================================
// EXPORTACIÓN DEL ALMACENAMIENTO
// ======================================================

export const tokenStorage = {

  // Obtener sesión actual
  async getSession(): Promise<AuthSession | null> {
    return currentSession;
  },

  // Guardar sesión
  async saveSession(
    session: AuthSession
  ): Promise<void> {
    currentSession = session;
  },

  // Eliminar sesión
  async clearSession(): Promise<void> {
    currentSession = null;
  },

};
