import { env } from '../../config/env';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError'; }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  if (!env.apiUrl) throw new Error('Configura EXPO_PUBLIC_API_URL para conectar el backend SCCVI.');
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers });
  if (!response.ok) throw new ApiError(response.status, `La API devolvió un error (HTTP ${response.status}).`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
