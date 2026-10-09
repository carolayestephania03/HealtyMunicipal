
import * as SecureStore from 'expo-secure-store';

import type {
  AuthSession,
} from '../../features/auth/types';

// ======================================================
// ALMACENAMIENTO SEGURO - ANDROID / IOS
// ======================================================

const STORAGE_KEY = 'sccvi_auth_session';

// ======================================================
// EXPORTACIÓN DEL ALMACENAMIENTO
// ======================================================

export const tokenStorage = {

  // Obtener sesión almacenada
  async getSession(): Promise<AuthSession | null> {

    const value = await SecureStore.getItemAsync(
      STORAGE_KEY
    );

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as AuthSession;
    } catch {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      return null;
    }
  },

  // Guardar sesión de manera segura
  async saveSession(
    session: AuthSession
  ): Promise<void> {

    await SecureStore.setItemAsync(
      STORAGE_KEY,
      JSON.stringify(session)
    );
  },

  // Eliminar sesión
  async clearSession(): Promise<void> {

    await SecureStore.deleteItemAsync(
      STORAGE_KEY
    );
  },

};
