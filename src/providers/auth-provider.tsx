
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  authService,
} from '../features/auth/services/auth.service';

import type {
  AuthSession,
  LoginCredentials,
} from '../features/auth/types';

import {
  tokenStorage,
} from '../services/storage/token-storage';

import {
  setApiAccessToken,
  setUnauthorizedHandler,
} from '../services/api/api-client';

// ===========================================
// CONTEXTO DE AUTENTICACIÓN
// ===========================================

export type AuthContextValue = {
  session: AuthSession | null;

  loading: boolean;

  signIn: (
    credentials: LoginCredentials
  ) => Promise<void>;

  signOut: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

// ===========================================
// VALIDAR SESIÓN RESTAURADA
// ===========================================

function isValidSession(
  value: unknown
): value is AuthSession {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    typeof session.token === 'string' &&
    session.token.length > 0 &&
    !!session.usuario &&
    typeof session.usuario === 'object' &&
    Number.isInteger(
      session.usuario.id_usuario
    ) &&
    Array.isArray(
      session.usuario.roles
    )
  );
}

// ===========================================
// PROVIDER
// ===========================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [loading, setLoading] = useState(true);

  // =========================================
  // CERRAR SESIÓN
  // =========================================

  const signOut = useCallback(async () => {
    // Invalidar inmediatamente el token en memoria.
    setApiAccessToken(null);
    setSession(null);

    try {
      await tokenStorage.clearSession();
    } catch (error) {
      console.warn(
        'No se pudo borrar la sesión almacenada:',
        error
      );
    }
  }, []);

  // =========================================
  // RESTAURAR SESIÓN
  // =========================================

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const stored =
          await tokenStorage.getSession();

        if (!active) return;

        if (isValidSession(stored)) {
          setApiAccessToken(stored.token);
          setSession(stored);
        } else {
          setApiAccessToken(null);
          setSession(null);
        }
      } catch (error) {
        if (active) {
          console.warn(
            'No se pudo restaurar la sesión:',
            error
          );

          setApiAccessToken(null);
          setSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // =========================================
  // CONTROL AUTOMÁTICO DE HTTP 401
  // =========================================

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [signOut]);

  // =========================================
  // INICIAR SESIÓN
  // =========================================

const signIn = useCallback(
  async (
    credentials: LoginCredentials
  ): Promise<void> => {

    // 1. Autenticar contra Express
    const newSession =
      await authService.login(credentials);

    // 2. Guardar sesión
    await tokenStorage.saveSession(newSession);

    console.log(
  'tokenStorage disponible:',
  typeof tokenStorage
);

console.log(
  'saveSession disponible:',
  typeof tokenStorage?.saveSession
);

    // 3. Configurar JWT para las peticiones
    setApiAccessToken(newSession.token);

    // 4. Actualizar el estado de autenticación
    setSession(newSession);
  },
  []
);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
