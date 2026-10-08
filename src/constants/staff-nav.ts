import type { Href } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
  Baby,
  Bell,
  FileBarChart,
  Home,
  MapPinned,
  Megaphone,
  Settings,
  Syringe,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react-native';

export type NavItem = {
  href: Href;
  label: string;
  icon: LucideIcon;
};

export const STAFF_NAV: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/ninos', label: 'Niños', icon: Baby },
  { href: '/padres', label: 'Padres y familias', icon: Users },
  { href: '/comunidades', label: 'Comunidades', icon: MapPinned },
  { href: '/crecimiento', label: 'Crecimiento', icon: TrendingUp },
  { href: '/vacunacion', label: 'Vacunación', icon: Syringe },
  { href: '/alertas', label: 'Alertas', icon: TriangleAlert },
  { href: '/campanas', label: 'Campañas y notificaciones', icon: Megaphone },
  { href: '/reportes', label: 'Reportes', icon: FileBarChart },
  { href: '/administracion', label: 'Administración', icon: Settings },
];

export const MOBILE_NAV: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/ninos', label: 'Niños', icon: Baby },
  { href: '/vacunacion', label: 'Vacunas', icon: Syringe },
  { href: '/alertas', label: 'Alertas', icon: TriangleAlert },
  { href: '/campanas', label: 'Avisos', icon: Bell },
];

export function isNavActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/' || pathname === '';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
