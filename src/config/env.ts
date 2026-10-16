
const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? ''
)
  .trim()
  .replace(/\/+$/, '');

export const env = {
  apiUrl: API_URL,
};

export function validateEnv(): void {
  if (!env.apiUrl) {
    throw new Error(
      'No se configuró EXPO_PUBLIC_API_URL en el archivo .env'
    );
  }

  try {
    const url = new URL(env.apiUrl);

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      throw new Error('Protocolo no válido');
    }
  } catch {
    throw new Error(
      'EXPO_PUBLIC_API_URL debe ser una dirección HTTP o HTTPS válida.'
    );
  }
}
