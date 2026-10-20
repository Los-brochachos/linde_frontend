import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { Auth } from '../../../core/auth/auth';
import { DASHBOARD_ROLES } from '../../../features/dashboard/dashboard-data';

const CLIENT_SECTIONS = [
  { key: 'pedidos', title: 'Mis pedidos', route: '/cliente/pedidos' },
  { key: 'citas', title: 'Citas', route: '/cliente/citas' },
  { key: 'seguimiento', title: 'Seguimiento', route: '/cliente/seguimiento' },
  { key: 'productos', title: 'Productos', route: '/cliente/productos' },
];

@Component({ selector: 'app-sidebar', imports: [RouterLink, RouterLinkActive, InputTextModule], templateUrl: './sidebar.html' })
export class Sidebar {
  readonly usuario = inject(Auth).usuario;
  readonly search = signal('');
  readonly isClient = computed(() => this.usuario()?.rol === 'CLIENTE');
  readonly home = computed(() => this.isClient() ? '/cliente/inicio' : '/dashboard');
  readonly profile = computed(() => this.isClient() ? '/cliente/perfil' : '/dashboard/perfil');
  readonly sections = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const menu = this.isClient() ? CLIENT_SECTIONS :
      (DASHBOARD_ROLES[this.usuario()?.rol ?? '']?.sections ?? []).map(section => ({
        key: section.key, title: section.title, route: `/dashboard/${section.key}`,
      }));
    return menu.filter(section => section.title.toLocaleLowerCase().includes(query));
  });
}
