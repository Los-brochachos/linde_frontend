import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, forkJoin, of, startWith, switchMap, tap } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido/pedido-service';
import { PedidoResponse, DetallePedidoResponse } from '../../../core/models/PedidoModel';

@Component({ selector: 'app-detalle-pedido', imports: [RouterLink, DecimalPipe], templateUrl: './detalle-pedido.html' })
export class DetallePedido {
  private readonly pedidos = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  private readonly navigationState = inject(Location).getState() as { pedidoCreado?: number };
  readonly pedido = signal<PedidoResponse | null>(null);
  readonly detalles = signal<DetallePedidoResponse[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly recienCreado = computed(() => this.pedido()?.idPedido === this.navigationState.pedidoCreado);
  readonly total = computed(() => this.detalles().reduce((suma, detalle) => suma + detalle.cantidad * detalle.precioUnitario, 0));
  constructor() {
    combineLatest([this.route.paramMap, this.reload.pipe(startWith(undefined))]).pipe(
      tap(() => { this.cargando.set(true); this.error.set(''); this.pedido.set(null); this.detalles.set([]); }),
      switchMap(([params]) => {
        const id = Number(params.get('id'));
        if (!Number.isSafeInteger(id) || id < 1) { this.error.set('El identificador del pedido no es válido.'); return of(null); }
        return forkJoin({ pedido: this.pedidos.miPedido(id), detalles: this.pedidos.detallesPropios(id) }).pipe(catchError(respuesta => {
          this.error.set(respuesta.status === 404 || respuesta.status === 403 ? 'El pedido no existe o no está disponible para tu cuenta.'
            : respuesta.status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.' : 'No se pudo cargar el pedido. Intenta nuevamente.');
          return of(null);
        }));
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe(resultado => { if (resultado) { this.pedido.set(resultado.pedido); this.detalles.set(resultado.detalles); } this.cargando.set(false); });
  }
  actualizar() { if (!this.cargando()) this.reload.next(); }
}
