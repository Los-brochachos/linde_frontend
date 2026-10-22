import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, Subject, startWith, switchMap, catchError, of } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../../../core/services/api.service';
import { PedidoResponse, DetallePedidoResponse } from '../../../../core/models/PedidoModel';
import { AtencionResponse } from '../../../../core/models/AtencionModel';

@Component({ selector: 'app-pedidos-programador', imports: [CommonModule, RouterLink, InputTextModule], templateUrl: './pedidos.html' })
export class PedidosProgramador {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seleccionar = new Subject<PedidoResponse>();
  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly atenciones = signal<AtencionResponse[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly consulta = signal('');
  readonly estado = signal('TODOS');
  readonly estados = ['RECIBIDO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO'];
  readonly pagina = signal(1);
  readonly seleccionado = signal<PedidoResponse | null>(null);
  readonly detalles = signal<DetallePedidoResponse[]>([]);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal('');
  readonly filtrados = computed(() => this.pedidos().filter(p =>
    (this.estado() === 'TODOS' || p.estado === this.estado()) &&
    [p.idPedido, p.razonSocial, p.prioridad, p.estado].some(v => String(v ?? '').toLocaleLowerCase().includes(this.consulta().trim().toLocaleLowerCase())))
    .sort((a, b) => b.idPedido - a.idPedido));
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / 10)));
  readonly actual = computed(() => Math.min(this.pagina(), this.paginas()));
  readonly visibles = computed(() => this.filtrados().slice((this.actual() - 1) * 10, this.actual() * 10));
  readonly pendientes = computed(() => this.pedidos().filter(p => this.puedeProgramar(p)).length);

  constructor() {
    this.seleccionar.pipe(switchMap(p => {
      this.seleccionado.set(p); this.detalles.set([]); this.errorDetalle.set(''); this.cargandoDetalle.set(true);
      return this.api.get<DetallePedidoResponse[]>(`pedidos/${p.idPedido}/detalles/activos`).pipe(catchError(() => {
        this.errorDetalle.set('No se pudieron consultar los productos del pedido.'); return of([]);
      }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(rows => { this.detalles.set(rows); this.cargandoDetalle.set(false); });
    this.cargar();
  }
  activa(p: PedidoResponse) { return this.atenciones().find(a => a.idPedido === p.idPedido && ['PROGRAMADA', 'EN_CURSO'].includes(a.estado)); }
  puedeProgramar(p: PedidoResponse) { return ['RECIBIDO', 'EN_PREPARACION'].includes(p.estado) && !this.activa(p); }
  ver(p: PedidoResponse) { this.seleccionar.next(p); }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set('');
    forkJoin({ pedidos: this.api.get<PedidoResponse[]>('pedidos'), atenciones: this.api.get<AtencionResponse[]>('atenciones') })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => { this.pedidos.set(data.pedidos); this.atenciones.set(data.atenciones); this.cargando.set(false); },
        error: () => { this.error.set('No se pudieron cargar los pedidos y sus programaciones. Intenta nuevamente.'); this.cargando.set(false); },
      });
  }
}
