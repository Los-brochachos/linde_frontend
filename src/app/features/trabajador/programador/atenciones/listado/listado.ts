import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../../../../core/services/api.service';
import { AtencionResponse } from '../../../../../core/models/AtencionModel';

type Grupo = 'PROGRAMADA' | 'EN_CURSO' | 'HISTORIAL';
@Component({ selector: 'app-atenciones-programador', imports: [CommonModule, RouterLink, InputTextModule], templateUrl: './listado.html' })
export class AtencionesProgramador {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly grupos: { key: Grupo; titulo: string }[] = [
    { key: 'PROGRAMADA', titulo: 'Programadas' }, { key: 'EN_CURSO', titulo: 'En curso' }, { key: 'HISTORIAL', titulo: 'Historial' },
  ];
  readonly grupo = signal<Grupo>('PROGRAMADA');
  readonly historial = signal('TODAS');
  readonly consulta = signal('');
  readonly pagina = signal(1);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly atenciones = signal<AtencionResponse[]>([]);
  readonly filas = computed(() => this.atenciones().map(a => ({ ...a,
    empresa: a.razonSocial || `Cliente del pedido #${a.idPedido}`,
    conductor: a.nombreConductor || `Conductor #${a.idConductor}`,
    cisterna: a.cisterna || `Cisterna #${a.idCisterna}`,
  })));
  readonly filtradas = computed(() => this.filas().filter(a => this.pertenece(a, this.grupo())
    && (this.grupo() !== 'HISTORIAL' || this.historial() === 'TODAS' || a.estado === this.historial())
    && [a.idAtencion, a.idPedido, a.empresa, a.conductor, a.cisterna, a.observaciones, a.estado]
      .some(v => String(v ?? '').toLocaleLowerCase().includes(this.consulta().trim().toLocaleLowerCase())))
    .sort((a, b) => this.grupo() === 'HISTORIAL' ? b.fechaInicioProgramada.localeCompare(a.fechaInicioProgramada)
      : a.fechaInicioProgramada.localeCompare(b.fechaInicioProgramada)));
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtradas().length / 10)));
  readonly actual = computed(() => Math.min(this.pagina(), this.paginas()));
  readonly visibles = computed(() => this.filtradas().slice((this.actual() - 1) * 10, this.actual() * 10));
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
      const grupo = p.get('grupo');
      this.grupo.set(grupo === 'EN_CURSO' || grupo === 'HISTORIAL' ? grupo : 'PROGRAMADA');
      const estado = p.get('estado'); this.historial.set(estado === 'FINALIZADA' || estado === 'CANCELADA' ? estado : 'TODAS');
      this.consulta.set(p.get('q') || '');
      const pagina = Number(p.get('pagina')); this.pagina.set(Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1);
    });
    this.cargar();
  }
  pertenece(a: AtencionResponse, grupo: Grupo) { return grupo === 'HISTORIAL' ? ['FINALIZADA', 'CANCELADA'].includes(a.estado) : a.estado === grupo; }
  cantidad(grupo: Grupo) { return this.atenciones().filter(a => this.pertenece(a, grupo)).length; }
  cambiar(cambios: { grupo?: string; estado?: string; q?: string; pagina?: number }) {
    void this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge',
      queryParams: { pagina: null, ...cambios }, replaceUrl: true });
  }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set('');
    this.api.get<AtencionResponse[]>('atenciones')
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: rows => { this.atenciones.set(rows); this.cargando.set(false); },
        error: () => { this.error.set('No se pudieron consultar las atenciones y los recursos asociados. Intenta nuevamente.'); this.cargando.set(false); },
      });
  }
}
