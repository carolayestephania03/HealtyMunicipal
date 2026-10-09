
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type AppIconName = ComponentProps<typeof Ionicons>['name'];

export const NAV_ICONS: Record<string, AppIconName> = {
  '/inicio': 'home-outline',
  '/dashboard': 'grid-outline',
  '/ninos': 'happy-outline',
  '/padres': 'people-outline',
  '/comunidades': 'location-outline',
  '/crecimiento': 'trending-up-outline',
  '/vacunacion': 'medkit-outline',
  '/carnet-qr': 'qr-code-outline',
  '/alertas': 'warning-outline',
  '/campanias': 'megaphone-outline',
  '/reportes': 'document-text-outline',
  '/administracion': 'people-circle-outline',
  '/configuracion': 'settings-outline',
  '/menu': 'menu-outline',
};
