import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { DASHBOARD_ROLES } from './features/dashboard/dashboard-data';

const sections = [...new Set(Object.values(DASHBOARD_ROLES).flatMap(config => config.sections.map(section => section.key)))];
const listado = () => import('./features/dashboard/listado/listado').then(m => m.Listado);

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'cliente', title: 'Linde · Clientes', data: { area: 'cliente' },
    canActivate: [authGuard], canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/client-layout/client-layout').then(m => m.ClientLayout),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./features/cliente/inicio/inicio').then(m => m.Inicio) },
      { path: 'citas', loadComponent: () => import('./features/cliente/citas/citas').then(m => m.Citas) },
      { path: 'pedidos/nuevo', data: { sectionKey: 'pedidos' }, loadComponent: () => import('./features/cliente/pedidos/nuevo-pedido').then(m => m.NuevoPedido) },
      { path: 'pedidos/:id', data: { sectionKey: 'pedidos' }, loadComponent: () => import('./features/cliente/pedidos/detalle-pedido').then(m => m.DetallePedido) },
      { path: 'pedidos', data: { sectionKey: 'pedidos' }, loadComponent: listado },
      { path: 'productos', data: { sectionKey: 'productos' }, loadComponent: listado },
      { path: 'seguimiento/:id', loadComponent: () => import('./features/cliente/seguimiento/seguimiento').then(m => m.Seguimiento) },
      { path: 'seguimiento', loadComponent: () => import('./features/cliente/seguimiento/seguimiento').then(m => m.Seguimiento) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil) },
    ],
  },
  {
    path: 'dashboard', title: 'Linde · Gestión', data: { area: 'staff' },
    canActivate: [authGuard], canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil) },
      { path: 'atenciones/nueva', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/dashboard/programar-atencion/programar-atencion').then(m => m.ProgramarAtencion) },
      { path: 'atenciones/asignadas/:id', data: { sectionKey: 'atenciones', roles: ['CONDUCTOR'] }, loadComponent: () => import('./features/dashboard/atencion-conductor/atencion-conductor').then(m => m.AtencionConductor) },
      { path: 'atenciones/:id/editar', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/dashboard/programar-atencion/programar-atencion').then(m => m.ProgramarAtencion) },
      { path: 'atenciones/:id/cancelar', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/dashboard/cancelar-atencion/cancelar-atencion').then(m => m.CancelarAtencion) },
      ...sections.map(key => ({ path: key, data: { sectionKey: key }, loadComponent: listado })),
    ],
  },
  {
    path: '', title: 'Linde', loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'nosotros', loadComponent: () => import('./features/nosotros/nosotros').then(m => m.Nosotros) },
      { path: 'contacto', loadComponent: () => import('./features/contacto/contacto').then(m => m.Contacto) },
      { path: 'productos', loadComponent: () => import('./features/productos/productos').then(m => m.Productos) },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
