
/**
 * SCCVI - Endpoints de la API
 *
 * Rutas base verificadas en app.js.
 *
 * URL del servidor:
 * EXPO_PUBLIC_API_URL=http://localhost:3000
 */

export const endpoints = {

  // ===================================
  // ESTADO DEL SERVIDOR
  // ===================================

  health: '/health',

  // ===================================
  // AUTENTICACIÓN
  // ===================================

  auth: {
    base: '/api/auth',
    login: '/api/auth/login',
  },

  // ===================================
  // REGISTROS
  // ===================================

  ninos: '/api/ninos',

  tutores: '/api/tutores',

  familias: '/api/familias',

  comunidades: '/api/comunidades',

  // ===================================
  // SEGUIMIENTO CLÍNICO
  // ===================================

  crecimiento: '/api/crecimiento',

  referenciasOms: '/api/referencias-oms',

  vacunas: '/api/vacunas',

  esquemaVacunacion: '/api/esquemas-vacunacion',

  vacunaciones: '/api/vacunaciones',

  carnets: '/api/carnets-digitales',

  alertas: '/api/alertas',

  // ===================================
  // COMUNICACIÓN
  // ===================================

  campanias: '/api/campanias',

  notificaciones: '/api/notificaciones',

  // ===================================
  // ADMINISTRACIÓN
  // ===================================

  usuarios: '/api/usuarios',

  roles: '/api/roles',

  centrosSalud: '/api/centros-salud',

  auditoria: '/api/auditoria',

} as const;
