import { inject } from '@angular/core';
import { Auth } from './core/auth/auth';
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { DASHBOARD_ROLES } from './features/dashboard/dashboard-data';

const sections = [...new Set(Object.values(DASHBOARD_ROLES).flatMap(config => config.sections.map(section => section.key)))];
const pedidosPersonal = () => inject(Auth).usuario()?.rol === 'PROGRAMADOR'
  ? import('./features/trabajador/programador/pedidos/pedidos').then(m => m.PedidosProgramador)
  : listado();
const atencionesPersonal = () => inject(Auth).usuario()?.rol === 'CONDUCTOR'
  ? import('./features/trabajador/conductor/atenciones/listado/listado').then(m => m.MisAtencionesConductor)
  : inject(Auth).usuario()?.rol === 'PROGRAMADOR'
  ? import('./features/trabajador/programador/atenciones/listado/listado').then(m => m.AtencionesProgramador)
  : listado();
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
      { path: 'productos', data: { sectionKey: 'productos' }, loadComponent: () => import('./features/cliente/productos-cliente/productos-cliente').then(m => m.ProductosCliente) },
      { path: 'seguimiento/:id', loadComponent: () => import('./features/cliente/seguimiento/seguimiento').then(m => m.Seguimiento) },
      { path: 'seguimiento', loadComponent: () => import('./features/cliente/seguimiento/seguimiento').then(m => m.Seguimiento) },
      { path: 'perfil', loadComponent: () => import('./features/cliente/perfil-cliente/perfil-cliente').then(m => m.PerfilCliente) },
      ...['seguridad', 'preferencias', 'ayuda'].map(pagina => ({ path: pagina, data: { pagina }, loadComponent: () => import('./features/cliente/opciones/opciones').then(m => m.OpcionesCliente) })),
    ],
  },
  {
    path: 'dashboard', title: 'Linde · Gestión', data: { area: 'staff' },
    canActivate: [authGuard], canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => inject(Auth).usuario()?.rol === 'PROGRAMADOR'
        ? import('./features/trabajador/programador/inicio/inicio').then(m => m.InicioProgramador)
        : import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'perfil', loadComponent: () => import('./features/trabajador/perfil/perfil').then(m => m.Perfil) },
      { path: 'trabajadores/nuevo', data: { sectionKey: 'trabajadores', roles: ['ADMIN'], modoTrabajador: 'crear' }, loadComponent: () => import('./features/trabajador/admin/trabajadores/formulario/formulario').then(m => m.FormularioTrabajador) },
      { path: 'trabajadores/:id/editar', data: { sectionKey: 'trabajadores', roles: ['ADMIN'], modoTrabajador: 'editar' }, loadComponent: () => import('./features/trabajador/admin/trabajadores/formulario/formulario').then(m => m.FormularioTrabajador) },
      { path: 'trabajadores/:id', data: { sectionKey: 'trabajadores', roles: ['ADMIN'], modoTrabajador: 'ver' }, loadComponent: () => import('./features/trabajador/admin/trabajadores/formulario/formulario').then(m => m.FormularioTrabajador) },
      { path: 'trabajadores', data: { sectionKey: 'trabajadores', roles: ['ADMIN'] }, loadComponent: () => import('./features/trabajador/admin/trabajadores/listado/listado').then(m => m.ListadoTrabajadores) },
      { path: 'atenciones/nueva', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/trabajador/programador/atenciones/programar-atencion/programar-atencion').then(m => m.ProgramarAtencion) },
      { path: 'atenciones/asignadas/:id', data: { sectionKey: 'atenciones', roles: ['CONDUCTOR'] }, loadComponent: () => import('./features/trabajador/conductor/atenciones/detalle/atencion-conductor').then(m => m.AtencionConductor) },
      { path: 'atenciones/:id/editar', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/trabajador/programador/atenciones/programar-atencion/programar-atencion').then(m => m.ProgramarAtencion) },
      { path: 'atenciones/:id/cancelar', data: { sectionKey: 'atenciones', roles: ['PROGRAMADOR'] }, loadComponent: () => import('./features/trabajador/programador/atenciones/cancelar-atencion/cancelar-atencion').then(m => m.CancelarAtencion) },
      ...sections.map(key => ({ path: key, data: { sectionKey: key }, loadComponent: key === 'pedidos' ? pedidosPersonal : key === 'atenciones' ? atencionesPersonal : listado })),
    ],
  },
  {
    path: '', title: 'Linde', loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'nosotros', loadComponent: () => import('./features/nosotros/nosotros').then(m => m.Nosotros) },
      { path: 'contacto', loadComponent: () => import('./features/contacto/contacto').then(m => m.Contacto) },
      { path: 'productos', loadComponent: () => import('./features/productos/productos').then(m => m.Producto) },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
