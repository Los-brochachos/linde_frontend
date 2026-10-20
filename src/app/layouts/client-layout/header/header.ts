import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { Auth } from '../../../core/auth/auth';

@Component({ selector: 'app-header', imports: [RouterLink, RouterLinkActive, ButtonModule, DialogModule], templateUrl: './header.html' })
export class Header {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = this.auth.usuario;
  mostrarModalConfirmacion = false;
  cerrando = false;
  error = '';
  abrirConfirmacion() { this.error = ''; this.mostrarModalConfirmacion = true; }
  cancelarCierre() { if (!this.cerrando) this.mostrarModalConfirmacion = false; }
  aceptarCierre() {
    if (this.cerrando) return;
    this.cerrando = true; this.error = '';
    this.auth.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.cerrando = false; this.mostrarModalConfirmacion = false; void this.router.navigateByUrl('/login'); },
      error: () => { this.cerrando = false; this.error = 'No se pudo cerrar la sesión. Intenta nuevamente.'; },
    });
  }
}
