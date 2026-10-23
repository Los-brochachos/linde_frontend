
import {
  Component,
  computed,
  inject,
  ViewEncapsulation
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-header',
  imports: [MenuModule, RouterLink, RippleModule],
  templateUrl: './header.html',
  encapsulation: ViewEncapsulation.None,
  styles: `

    .without-user-menu {
      width: 290px !important;
      max-width: calc(100vw - 16px) !important;
      padding: 4px 0 !important;
      background: #ffffff !important;
      color: #334155 !important;
      border: 1px solid #e2e8f0 !important;
      border-top: 3px solid #007ac3 !important;
      border-radius: 0 0 6px 6px !important;
      box-shadow: 0 8px 20px rgba(0, 45, 84, 0.12) !important;
      overflow: hidden;
      margin-top: 6px !important;
    }

    .without-user-menu .p-menu-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0 !important;
      margin: 0 !important;
    }

    .without-user-menu .p-menu-item,
    .without-user-menu .p-menu-item-content {
      margin: 0 !important;
      background: transparent !important;
      border-radius: 0 !important;
    }

    .without-user-menu .p-menu-item-content:hover,
    .without-user-menu .p-menu-item.p-focus > .p-menu-item-content {
      background: #f1f5f9 !important;
    }

    .without-user-menu .without-menu-link {
      width: 100%;
      padding: 11px 16px;
      border-radius: 0 !important;
      background: transparent !important;
      text-decoration: none;
    }

    .without-user-menu .p-menu-separator {
      margin: 4px 12px !important;
      border-color: #e2e8f0 !important;
    }

  `
})
export class Header {

  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuario;

  readonly items = computed<MenuItem[]>(() => {

    const base = this.usuario()?.rol === 'CLIENTE'
      ? '/cliente'
      : '/dashboard';

    return [
      {
        label: 'Mi perfil',
        icon: 'pi pi-user',
        routerLink: `${base}/perfil`
      },
      {
        label: 'Seguridad',
        icon: 'pi pi-shield',
        routerLink: `${base}/seguridad`
      },
      {
        label: 'Preferencias',
        icon: 'pi pi-cog',
        routerLink: `${base}/preferencias`
      },
      {
        label: 'Centro de ayuda',
        icon: 'pi pi-question-circle',
        routerLink: `${base}/ayuda`
      },
      {
        separator: true
      },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.cerrarSesion()
      }
    ];
  });

  cerrarSesion(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: () => {
        console.error('No se pudo cerrar la sesión');
      }
    });
  }
}
