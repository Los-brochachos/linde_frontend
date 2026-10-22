import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, forkJoin, of, startWith, switchMap, tap } from 'rxjs';
import { PedidoResponse, SeguimientoPedidoResponse } from '../../../core/models/PedidoModel';
import { PedidoService } from '../../../core/services/pedido/pedido-service';
import { SeguimientoPedidoService } from '../../../core/services/pedido/seguimiento-pedido-service';
import { PortalPreferencias } from '../../../core/services/portal-preferencias';

@Component({ imports: [CommonModule, RouterLink], selector: 'app-seguimiento', templateUrl: './seguimiento.html' })
export class Seguimiento {
  private readonly pedidosService = inject(PedidoService);
  private readonly seguimientoService = inject(SeguimientoPedidoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly pedido = signal<PedidoResponse | null>(null);
  readonly eventos = signal<SeguimientoPedidoResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedId = signal('');
  readonly preferencias = inject(PortalPreferencias);
  readonly listaError = signal('');
  readonly pasos = ['RECIBIDO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO'];
  constructor() {
    this.pedidosService.misPedidos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: pedidos => this.pedidos.set([...pedidos].sort((a, b) => b.idPedido - a.idPedido)),
      error: () => this.listaError.set('No se pudo cargar la lista de tus pedidos. Actualiza la página para reintentar.'),
    });
    combineLatest([this.route.paramMap, this.reload.pipe(startWith(undefined))]).pipe(tap(([params]) => {
      this.selectedId.set(params.get('id') ?? ''); this.loading.set(true); this.error.set(''); this.pedido.set(null); this.eventos.set([]);
    }), switchMap(() => {
      const id = Number(this.selectedId());
      if (!this.selectedId()) return of(null);
      if (!Number.isSafeInteger(id) || id < 1) { this.error.set('El identificador del pedido no es válido.'); return of(null); }
      return forkJoin({ pedido: this.pedidosService.miPedido(id), eventos: this.seguimientoService.propio(id) }).pipe(catchError(error => {
        this.error.set([403,404].includes(error.status) ? 'No puedes consultar ese pedido o no existe.' : 'No se pudo consultar el seguimiento.'); return of(null);
      }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      if (data) { this.pedido.set(data.pedido); this.eventos.set([...data.eventos].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora) || a.idSeguimiento - b.idSeguimiento)); }
      this.loading.set(false);
    });
  }
  select(id: string) { void this.router.navigate(id ? ['/cliente/seguimiento', id] : ['/cliente/seguimiento']); }
  refresh() { this.reload.next(); }
}
