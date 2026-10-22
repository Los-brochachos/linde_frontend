
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    ButtonDirective,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {

  private readonly router = inject(Router);

  // Estados del navbar
  menuAbierto = signal(false);
  buscadorAbierto = signal(false);
  busqueda = signal('');

  // Referencia al input de búsqueda
  @ViewChild('campoBusqueda') campoBusqueda?: ElementRef<HTMLInputElement>;

  // Abrir o cerrar menú móvil
  toggleMenu(): void {
    this.menuAbierto.update(valor => !valor);
    this.buscadorAbierto.set(false);
  }

  // Abrir o cerrar buscador
  toggleBuscador(): void {
    const abrir = !this.buscadorAbierto();

    this.buscadorAbierto.set(abrir);
    this.menuAbierto.set(false);

    if (abrir) {
      setTimeout(() => {
        this.campoBusqueda?.nativeElement.focus();
      }, 0);
    }
  }

  // Cerrar paneles
  cerrarPaneles(): void {
    this.menuAbierto.set(false);
    this.buscadorAbierto.set(false);
  }

  // Buscar productos
  buscar(): void {
    const termino = this.busqueda().trim();

    if (!termino) return;

    this.cerrarPaneles();

    this.router.navigate(['/productos'], {
      queryParams: { buscar: termino },
    });
  }
}
