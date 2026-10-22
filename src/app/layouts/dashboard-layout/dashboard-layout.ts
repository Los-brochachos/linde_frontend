
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {

  private readonly router = inject(Router);

  // Controla si el Sidebar está abierto en dispositivos móviles.
  readonly sidebarOpen = signal(false);

  constructor() {
    // Cierra el Sidebar cuando el usuario cambia de sección.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.closeSidebar();
      });
  }

  // Abre o cierra el Sidebar.
  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  // Cierra el Sidebar.
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
