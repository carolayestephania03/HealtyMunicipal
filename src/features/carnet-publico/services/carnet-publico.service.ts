import type { RespuestaExpediente } from '../types';

// Sin JWT y sin persistencia del token/PIN en AsyncStorage ni localStorage.
// Configurar EXPO_PUBLIC_API_URL con la URL accesible desde el dispositivo del padre.
export const consultarCarnetPublico = async (
  token: string,
  pin: string,
): Promise<RespuestaExpediente> => {
  const origen = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(origen)) {
    throw new Error('Configure EXPO_PUBLIC_API_URL con la dirección pública de la API.');
  }
  const respuesta = await fetch(`${origen}/api/carnets-digitales/publico/consultar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token, pin }),
    cache: 'no-store',
  });
  const json: unknown = await respuesta.json().catch(() => null);
  const cuerpo = json as Partial<RespuestaExpediente> | null;
  if (!respuesta.ok || cuerpo?.success !== true || !cuerpo.data) {
    throw new Error(cuerpo?.message || `La consulta no pudo completarse (HTTP ${respuesta.status}).`);
  }
  return cuerpo as RespuestaExpediente;
};
