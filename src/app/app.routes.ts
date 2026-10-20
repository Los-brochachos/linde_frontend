import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { Citas } from './features/cliente/citas/citas';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  {
    path: 'cliente', loadComponent: () => import('./layouts/client-layout/client-layout').then(m => m.ClientLayout), title: "Linde",
    children:[
      {path: 'inicio', loadComponent: () => import('./features/cliente/inicio/inicio').then(m => m.Inicio)},
      {path: 'citas', loadComponent: () => import('./features/cliente/citas/citas').then(m => m.Citas)},
      {path: 'seguimiento', loadComponent: () => import('./features/cliente/seguimiento/seguimiento').then(m => m.Seguimiento)}
    ]
  },
  
  {
    path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout), title: "Linde",
    
    children: [
      {path: '', loadComponent: () => import('./features/dashboard/dashboard') .then(m => m.Dashboard)}
    ]
  },

  {
    path: '', loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout), title:"Linde",
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m=>m.Inicio)},
      { path: 'nosotros', loadComponent: () => import('./features/nosotros/nosotros').then(m=>m.Nosotros)},
      { path: 'contacto', loadComponent: () => import('./features/contacto/contacto').then(m=>m.Contacto)},
      { path: 'productos', loadComponent: () => import('./features/productos/productos').then(m=>m.Productos)}
    ]
  },

  {
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    
    children: [
      {path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil)},
      {path: '', pathMatch: 'full', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)}
    ]
  },

  //Ruta  generica
  { path: '**', redirectTo: 'inicio' }
];
