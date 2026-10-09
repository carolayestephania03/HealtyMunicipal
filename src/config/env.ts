// Únicamente variables públicas. Nunca colocar contraseñas ni claves privadas EXPO_PUBLIC_*.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '',
};
