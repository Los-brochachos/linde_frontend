import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PedidoResponse } from '../../../../core/models/PedidoModel';
import { AtencionResponse } from '../../../../core/models/AtencionModel';

interface Alerta { idAlerta: number; tipo: string; mensaje: string; fechaHora: string; estado: string; idAtencion: number; }
@Component({ selector: 'app-inicio-programador', imports: [CommonModule, RouterLink], templateUrl: './inicio.html' })
export class InicioProgramador {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly atenciones = signal<AtencionResponse[]>([]);
  readonly alertas = signal<Alerta[]>([]);
  readonly pendientes = computed(() => this.pedidos().filter(p => ['RECIBIDO', 'EN_PREPARACION'].includes(p.estado)
    && !this.atenciones().some(a => a.idPedido === p.idPedido && ['PROGRAMADA', 'EN_CURSO'].includes(a.estado)))
    .sort((a, b) => {
      const prioridades: Record<string, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };
      return (prioridades[a.prioridad] ?? 3) - (prioridades[b.prioridad] ?? 3)
        || a.fechaEntregaEstimada.localeCompare(b.fechaEntregaEstimada) || a.idPedido - b.idPedido;
    }));
  readonly programadas = computed(() => this.atenciones().filter(a => a.estado === 'PROGRAMADA')
    .sort((a, b) => a.fechaInicioProgramada.localeCompare(b.fechaInicioProgramada)));
  readonly enCurso = computed(() => this.atenciones().filter(a => a.estado === 'EN_CURSO')
    .sort((a, b) => (a.fechaInicio || a.fechaInicioProgramada).localeCompare(b.fechaInicio || b.fechaInicioProgramada)));
  readonly alertasPendientes = computed(() => this.alertas().filter(a => a.estado === 'PENDIENTE')
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)));
  readonly revisadas = computed(() => this.alertas().filter(a => a.estado === 'REVISADA').length);
  empresa(a: AtencionResponse) { return a.razonSocial || this.pedidos().find(p => p.idPedido === a.idPedido)?.razonSocial || `Pedido #${a.idPedido}`; }
  constructor() { this.cargar(); }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set('');
    forkJoin({ pedidos: this.api.get<PedidoResponse[]>('pedidos'), atenciones: this.api.get<AtencionResponse[]>('atenciones'), alertas: this.api.get<Alerta[]>('alertas') })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: d => { this.pedidos.set(d.pedidos); this.atenciones.set(d.atenciones); this.alertas.set(d.alertas); this.cargando.set(false); },
        error: () => { this.error.set('No se pudo consultar el resumen de operaciones. Intenta nuevamente.'); this.cargando.set(false); },
      });
  }
}
