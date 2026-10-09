
import { env, validateEnv } from '../../config/env';

// ===========================================
// ERROR DE LA API
// ===========================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ===========================================
// TOKEN DE LA SESIÓN ACTIVA
// ===========================================

let activeToken: string | null = null;

let unauthorizedHandler: (() => void) | null = null;

export function setApiAccessToken(
  token: string | null
): void {
  activeToken = token;
}

export function setUnauthorizedHandler(
  handler: (() => void) | null
): void {
  unauthorizedHandler = handler;
}

// ===========================================
// OPCIONES DE SOLICITUD
// ===========================================

type ApiRequestOptions = RequestInit & {
  accessToken?: string;

  // Para endpoints públicos como login.
  skipAuth?: boolean;
};

// ===========================================
// MENSAJES DE ERROR
// ===========================================

function getErrorMessage(
  data: unknown,
  status: number
): string {
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    const object = data as Record<string, unknown>;

    if (typeof object.message === 'string') {
      return object.message;
    }

    if (typeof object.error === 'string') {
      return object.error;
    }
  }

  return `Error HTTP ${status}`;
}

// ===========================================
// SOLICITUD GENERAL
// ===========================================

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  validateEnv();

  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(
      'La ruta de la API debe comenzar con /.'
    );
  }

  const {
    accessToken,
    skipAuth = false,
    headers: customHeaders,
    ...requestOptions
  } = options;

  const token = skipAuth
    ? null
    : accessToken ?? activeToken;

  const headers = new Headers(customHeaders);

  headers.set('Accept', 'application/json');

  if (
    requestOptions.body !== undefined &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${env.apiUrl}${path}`,
      {
        ...requestOptions,
        headers,
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    throw new ApiError(
      0,
      'No se pudo establecer conexión con la API.'
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  // =========================================
  // SESIÓN EXPIRADA O TOKEN NO AUTORIZADO
  // =========================================

  if (
    response.status === 401 &&
    !skipAuth &&
    token &&
    token === activeToken
  ) {
    unauthorizedHandler?.();
  }

  // =========================================
  // ERRORES HTTP
  // =========================================

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(
        responseData,
        response.status
      )
    );
  }

  return responseData as T;
}

// ===========================================
// MÉTODOS REUTILIZABLES
// ===========================================

export const api = {
  get: <T>(
    path: string,
    accessToken?: string,
    signal?: AbortSignal
  ) =>
    apiRequest<T>(path, {
      method: 'GET',
      accessToken,
      signal,
    }),

  post: <T>(
    path: string,
    body: unknown,
    accessToken?: string
  ) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      accessToken,
    }),

  put: <T>(
    path: string,
    body: unknown,
    accessToken?: string
  ) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      accessToken,
    }),

  patch: <T>(
    path: string,
    body: unknown,
    accessToken?: string
  ) =>
    apiRequest<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      accessToken,
    }),

  delete: <T>(
    path: string,
    accessToken?: string
  ) =>
    apiRequest<T>(path, {
      method: 'DELETE',
      accessToken,
    }),
};
