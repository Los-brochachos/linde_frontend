import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../../core/auth/auth';
import { ClienteResponse } from '../../../core/models/ClienteModel';
import { AtencionResponse } from '../../../core/models/AtencionModel';
import { ClienteService } from '../../../core/services/cliente/cliente-service';
import { AtencionService } from '../../../core/services/atencion/atencion-service';

@Component({ imports: [RouterLink, CommonModule], selector: 'app-inicio', templateUrl: './inicio.html' })
export class Inicio {
  private readonly clientes = inject(ClienteService);
  private readonly atenciones = inject(AtencionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = inject(Auth).usuario;
  readonly cliente = signal<ClienteResponse | null>(null);
  readonly citas = signal<AtencionResponse[]>([]);
  readonly pendientes = computed(() => this.citas().filter(cita => ['PROGRAMADA','EN_CURSO'].includes(cita.estado)));
  readonly loading = signal(false);
  readonly error = signal('');
  constructor() { this.load(); }
  load() {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    forkJoin({ cliente: this.clientes.me(), citas: this.atenciones.misAtenciones() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.cliente.set(data.cliente); this.citas.set(data.citas); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('No se pudo cargar tu información. Intenta nuevamente.'); },
    });
  }
}
