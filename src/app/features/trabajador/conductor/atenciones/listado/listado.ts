import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../../../../core/services/api.service';
import { AtencionResponse } from '../../../../../core/models/AtencionModel';

@Component({ selector: 'app-mis-atenciones-conductor', imports: [CommonModule, RouterLink, InputTextModule], templateUrl: './listado.html' })
export class MisAtencionesConductor {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly atenciones = signal<AtencionResponse[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly grupo = signal('PROGRAMADA');
  readonly consulta = signal('');
  readonly historial = signal('TODAS');
  readonly pagina = signal(1);
  readonly grupos = [{ key: 'PROGRAMADA', titulo: 'Pendientes de aceptar' }, { key: 'EN_CURSO', titulo: 'En curso' }, { key: 'HISTORIAL', titulo: 'Historial' }];
  readonly enCurso = computed(() => this.atenciones().find(a => a.estado === 'EN_CURSO') || null);
  readonly filtradas = computed(() => this.atenciones().filter(a => this.pertenece(a, this.grupo())
    && (this.grupo() !== 'HISTORIAL' || this.historial() === 'TODAS' || a.estado === this.historial())
    && [a.idAtencion, a.idPedido, a.razonSocial, a.cisterna, a.observaciones].some(v => String(v ?? '').toLocaleLowerCase().includes(this.consulta().trim().toLocaleLowerCase())))
    .sort((a, b) => this.grupo() === 'HISTORIAL' ? b.fechaInicioProgramada.localeCompare(a.fechaInicioProgramada) : a.fechaInicioProgramada.localeCompare(b.fechaInicioProgramada)));
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtradas().length / 10)));
  readonly actual = computed(() => Math.min(this.pagina(), this.paginas()));
  readonly visibles = computed(() => this.filtradas().slice((this.actual() - 1) * 10, this.actual() * 10));
  pertenece(a: AtencionResponse, grupo: string) { return grupo === 'HISTORIAL' ? ['FINALIZADA', 'CANCELADA'].includes(a.estado) : a.estado === grupo; }
  cantidad(grupo: string) { return this.atenciones().filter(a => this.pertenece(a, grupo)).length; }
  constructor() { this.cargar(); }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set('');
    this.api.get<AtencionResponse[]>('atenciones/asignadas').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.atenciones.set(rows); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron consultar tus atenciones asignadas. Intenta nuevamente.'); this.cargando.set(false); },
    });
  }
}
