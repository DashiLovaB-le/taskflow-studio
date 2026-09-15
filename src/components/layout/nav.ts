import {
  CalendarIcon,
  DashboardIcon,
  GearIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import type { ComponentType, SVGProps } from 'react';

export type AppNavItem = {
  path: string;
  labelKey: string;
  titleKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const APP_NAV: AppNavItem[] = [
  { path: '/dashboard', labelKey: 'Dashboard', titleKey: 'Dashboard', icon: DashboardIcon },
  { path: '/tasks', labelKey: 'Tasks', titleKey: 'Tasks', icon: ListBulletIcon },
  { path: '/calendar', labelKey: 'Calendar', titleKey: 'Calendar', icon: CalendarIcon },
  { path: '/settings', labelKey: 'Settings', titleKey: 'Settings', icon: GearIcon },
];

export function titleKeyForPath(pathname: string): string {
  if (pathname.startsWith('/notifications')) return 'Notifications';
  const hit = APP_NAV.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
  return hit?.titleKey ?? 'TaskDay';
}
