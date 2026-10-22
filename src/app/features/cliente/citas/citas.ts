import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { PortalPreferencias } from '../../../core/services/portal-preferencias';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AtencionResponse } from '../../../core/models/AtencionModel';
import { AtencionService } from '../../../core/services/atencion/atencion-service';

type Grupo = 'proximas' | 'curso' | 'historial';

@Component({ imports: [CommonModule, RouterLink], selector: 'app-citas', templateUrl: './citas.html' })
export class Citas {
  private readonly service = inject(AtencionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly citas = signal<AtencionResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly preferencias = inject(PortalPreferencias);
  readonly grupo = signal<Grupo>('proximas');
  readonly estadoHistorial = signal('TODAS');
  readonly grupos: { key: Grupo; titulo: string }[] = [
    { key: 'proximas', titulo: 'Próximas' },
    { key: 'curso', titulo: 'En curso' },
    { key: 'historial', titulo: 'Historial' },
  ];
  readonly visibles = computed(() => this.citas().filter(c => {
    if (this.grupo() === 'proximas') return c.estado === 'PROGRAMADA';
    if (this.grupo() === 'curso') return c.estado === 'EN_CURSO';
    return ['FINALIZADA', 'CANCELADA'].includes(c.estado)
      && (this.estadoHistorial() === 'TODAS' || c.estado === this.estadoHistorial());
  }).sort((a, b) => this.grupo() === 'historial'
    ? b.fechaInicioProgramada.localeCompare(a.fechaInicioProgramada)
    : a.fechaInicioProgramada.localeCompare(b.fechaInicioProgramada)));
  readonly vacio = computed(() => ({
    proximas: 'No tienes atenciones programadas.',
    curso: 'No tienes atenciones en curso.',
    historial: 'No hay atenciones en el historial con este filtro.',
  })[this.grupo()]);

  constructor() {
    effect(() => {
      const estado = this.preferencias.citasEstado();
      this.grupo.set(estado === 'EN_CURSO' ? 'curso'
        : ['FINALIZADA', 'CANCELADA'].includes(estado) ? 'historial' : 'proximas');
      this.estadoHistorial.set(['FINALIZADA', 'CANCELADA'].includes(estado) ? estado : 'TODAS');
    });
    this.load();
  }
  cantidad(grupo: Grupo): number {
    return this.citas().filter(c => grupo === 'proximas' ? c.estado === 'PROGRAMADA'
      : grupo === 'curso' ? c.estado === 'EN_CURSO' : ['FINALIZADA', 'CANCELADA'].includes(c.estado)).length;
  }
  vencida(cita: AtencionResponse): boolean {
    return cita.estado === 'PROGRAMADA' && new Date(cita.fechaInicioProgramada).getTime() < Date.now();
  }
  load() {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.service.misAtenciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.citas.set(rows); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron consultar tus citas.'); this.loading.set(false); },
    });
  }
}
