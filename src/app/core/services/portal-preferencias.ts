import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Auth } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class PortalPreferencias {
  private readonly auth = inject(Auth);
  readonly formato = signal('dd/MM/yyyy');
  readonly formatoHora = computed(() => this.formato() + ' HH:mm');
  readonly citasEstado = signal('TODAS');
  constructor() {
    effect(() => {
      const id = this.auth.usuario()?.idUsuario;
      let datos: { formato?: string; citasEstado?: string } = {};
      try { datos = JSON.parse(localStorage.getItem(`without-preferencias-${id}`) || '{}') || {}; } catch { /* Conserva los valores predeterminados. */ }
      this.formato.set(datos.formato === 'yyyy-MM-dd' ? 'yyyy-MM-dd' : 'dd/MM/yyyy');
      this.citasEstado.set(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'].includes(datos.citasEstado || '') ? datos.citasEstado! : 'TODAS');
    });
  }
  guardar(formato: string, citasEstado: string) {
    localStorage.setItem(`without-preferencias-${this.auth.usuario()?.idUsuario}`, JSON.stringify({ formato, citasEstado }));
    this.formato.set(formato); this.citasEstado.set(citasEstado);
  }
}
