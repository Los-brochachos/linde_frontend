import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout), 
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m=>m.Inicio)},
      { path: 'nosotros', loadComponent: () => import('./features/nosotros/nosotros').then(m=>m.Nosotros)},
      { path: 'contacto', loadComponent: () => import('./features/contacto/contacto').then(m=>m.Contacto)},
      { path: 'productos', loadComponent: () => import('./features/productos/productos').then(m=>m.Productos)}
    ]
  },

  //Ruta  generica
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];
