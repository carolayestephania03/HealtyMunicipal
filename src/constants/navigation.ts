export type NavigationItem = { label: string; href: string; symbol: string };
export type NavigationGroup = { title: string; items: NavigationItem[] };

export const NAV_GROUPS: NavigationGroup[] = [
  { title: 'PRINCIPAL', items: [
    { label: 'Inicio', href: '/inicio', symbol: '⌂' },
    { label: 'Dashboard', href: '/dashboard', symbol: '▦' },
  ] },
  { title: 'REGISTROS', items: [
    { label: 'Niños', href: '/ninos', symbol: '◉' },
    { label: 'Padres y familias', href: '/padres', symbol: '♧' },
    { label: 'Comunidades', href: '/comunidades', symbol: '⌖' },
  ] },
  { title: 'SEGUIMIENTO CLÍNICO', items: [
    { label: 'Crecimiento', href: '/crecimiento', symbol: '↗' },
    { label: 'Vacunación', href: '/vacunacion', symbol: '✚' },
    { label: 'Carnet digital QR', href: '/carnet-qr', symbol: '▤' },
    { label: 'Alertas', href: '/alertas', symbol: '⚠' },
  ] },
  { title: 'COMUNICACIÓN', items: [
    { label: 'Campañas y notificaciones', href: '/campanias', symbol: '✉' },
  ] },
  { title: 'ANÁLISIS', items: [
    { label: 'Reportes', href: '/reportes', symbol: '▥' },
  ] },
  { title: 'ADMINISTRACIÓN', items: [
    { label: 'Usuarios y roles', href: '/administracion', symbol: '⚙' },
    { label: 'Configuración', href: '/configuracion', symbol: '☷' },
  ] },
];

export const BOTTOM_NAV: NavigationItem[] = [
  { label: 'Inicio', href: '/inicio', symbol: '⌂' },
  { label: 'Niños', href: '/ninos', symbol: '◉' },
  { label: 'Crecimiento', href: '/crecimiento', symbol: '↗' },
  { label: 'Vacunas', href: '/vacunacion', symbol: '✚' },
  { label: 'Más', href: '/menu', symbol: '☷' },
];
