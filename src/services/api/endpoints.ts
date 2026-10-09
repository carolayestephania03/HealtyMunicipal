// Ajustar estas rutas al contrato real de la API Express SCCVI antes de integrarlas.
export const endpoints = {
  ninos: '/ninos',
  tutores: '/tutores',
  familias: '/familias',
  comunidades: '/comunidades',
  crecimiento: '/crecimiento',
  vacunacion: '/vacunaciones',
  esquemaVacunacion: '/esquema-vacunacion',
  alertas: '/alertas',
  campanias: '/campanias',
  notificaciones: '/notificaciones',
  reportes: '/reportes',
} as const;
