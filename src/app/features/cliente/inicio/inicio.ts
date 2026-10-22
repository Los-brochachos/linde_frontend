import { PortalPreferencias } from '../../../core/services/portal-preferencias';
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
import { PedidoService } from '../../../core/services/pedido/pedido-service';
import { PedidoResponse } from '../../../core/models/PedidoModel';

@Component({ imports: [RouterLink, CommonModule], selector: 'app-inicio', templateUrl: './inicio.html' })
export class Inicio {
  private readonly clientes = inject(ClienteService);
  private readonly atenciones = inject(AtencionService);
  private readonly pedidosService = inject(PedidoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = inject(Auth).usuario;
  readonly preferencias = inject(PortalPreferencias);
  readonly cliente = signal<ClienteResponse | null>(null);
  readonly citas = signal<AtencionResponse[]>([]);
  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly recibidos = computed(() => this.pedidos().filter(p => p.estado === 'RECIBIDO').length);
  readonly enAtencion = computed(() => this.pedidos().filter(p => ['EN_PREPARACION', 'DESPACHADO'].includes(p.estado)).length);
  readonly entregados = computed(() => this.pedidos().filter(p => p.estado === 'ENTREGADO').length);
  readonly cancelados = computed(() => this.pedidos().filter(p => p.estado === 'CANCELADO').length);
  readonly recientes = computed(() => [...this.pedidos()].sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro) || b.idPedido - a.idPedido).slice(0, 5));
  readonly programadas = computed(() => this.citas().filter(a => a.estado === 'PROGRAMADA').sort((a, b) => a.fechaInicioProgramada.localeCompare(b.fechaInicioProgramada)).slice(0, 5));
  readonly enCurso = computed(() => this.citas().filter(a => a.estado === 'EN_CURSO'));
  readonly pendientes = computed(() => this.citas().filter(cita => ['PROGRAMADA','EN_CURSO'].includes(cita.estado)));
  readonly loading = signal(false);
  readonly error = signal('');
  constructor() { this.load(); }
  load() {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    forkJoin({ cliente: this.clientes.me(), citas: this.atenciones.misAtenciones(), pedidos: this.pedidosService.misPedidos() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.cliente.set(data.cliente); this.citas.set(data.citas); this.pedidos.set(data.pedidos); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('No se pudo cargar tu información. Intenta nuevamente.'); },
    });
  }
}
