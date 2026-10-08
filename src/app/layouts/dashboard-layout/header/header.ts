import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/auth/auth';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';


@Component({
  imports: [MenuModule],
  selector: 'app-header',
  templateUrl: './header.html',
})
export class Header {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuario;

  readonly items: MenuItem[] = [
    {
      label: 'Mi perfil',
      icon: 'pi pi-user',
      routerLink: '/dashboard/perfil'
    },
    {
      separator: true
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.cerrarSesion()
    }

  ]

  cerrarSesion(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: () => {
        // No confirmar un cierre de sesión del servidor si falló.
        console.error('No se pudo cerrar la sesión');
      }
    });
  }
}
