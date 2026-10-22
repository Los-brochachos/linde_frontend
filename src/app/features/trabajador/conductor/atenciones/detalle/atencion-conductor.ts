import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, forkJoin, map, of, startWith, switchMap, tap } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { AtencionResponse } from '../../../../../core/models/AtencionModel';

@Component({ selector: 'app-atencion-conductor', imports: [CommonModule, RouterLink], templateUrl: './atencion-conductor.html' })
export class AtencionConductor {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly atencion = signal<AtencionResponse | null>(null);
  readonly enCurso = signal<AtencionResponse | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly confirmarFin = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  constructor() {
    combineLatest([this.route.paramMap, this.reload.pipe(startWith(undefined))]).pipe(
      tap(() => { this.cargando.set(true); this.atencion.set(null); this.error.set(''); this.mensaje.set(''); this.confirmarFin.set(false); }),
      switchMap(([params]) => {
        const id = Number(params.get('id'));
        if (!Number.isSafeInteger(id) || id < 1) { this.error.set('El identificador de la atención no es válido.'); return of(null); }
        return forkJoin({ actual: this.api.get<AtencionResponse>(`atenciones/asignadas/${id}`), asignadas: this.api.get<AtencionResponse[]>('atenciones/asignadas') }).pipe(map(d => { this.enCurso.set(d.asignadas.find(a => a.estado === 'EN_CURSO') || null); return d.actual; }), catchError(e => { this.error.set(this.errorTexto(e.status)); return of(null); }));
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe(a => { this.atencion.set(a); this.cargando.set(false); });
  }
  actualizar() { if (!this.guardando() && !this.cargando()) this.reload.next(); }
  cambiar(accion: 'iniciar' | 'finalizar') {
    const a = this.atencion();
    if (!a || this.guardando() || (accion === 'iniciar' ? a.estado !== 'PROGRAMADA' || !!this.enCurso() : a.estado !== 'EN_CURSO' || !this.confirmarFin())) return;
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    this.api.patch<AtencionResponse>(`atenciones/${a.idAtencion}/${accion}`, {}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizada => { this.atencion.set(actualizada); this.enCurso.set(accion === 'iniciar' ? actualizada : null); this.guardando.set(false); this.confirmarFin.set(false); this.mensaje.set(accion === 'iniciar' ? 'Atención iniciada correctamente.' : 'Atención finalizada correctamente.'); },
      error: e => { this.guardando.set(false); this.confirmarFin.set(false); this.error.set(e.status === 400 ? (e.error?.message || 'El estado de la atención no permite esta acción. Actualiza los datos.') : this.errorTexto(e.status)); },
    });
  }
  private errorTexto(status: number) {
    return status === 404 ? 'La atención no existe o no está asignada a tu cuenta.' : status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.'
      : status === 403 ? 'No tienes permiso para realizar esta acción.' : 'No se pudo confirmar la operación. Actualiza la atención antes de intentarlo nuevamente.';
  }
}
