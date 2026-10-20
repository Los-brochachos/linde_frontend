import { DASHBOARD_ROLES } from '../../features/dashboard/dashboard-data';

export function homeForRole(role?: string): string {
  return role === 'CLIENTE' ? '/cliente/inicio' : '/dashboard';
}

export function canAccessArea(role: string, area?: string): boolean {
  if (area === 'cliente') return role === 'CLIENTE';
  if (area === 'staff') return role !== 'CLIENTE' && !!DASHBOARD_ROLES[role];
  return true;
}

export function canAccessSection(role: string, key?: string): boolean {
  return !key || !!DASHBOARD_ROLES[role]?.sections.some(section => section.key === key);
}
