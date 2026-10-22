import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, tap, catchError } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { AtencionResponse } from '../../../../../core/models/AtencionModel';

@Component({ selector: 'app-cancelar-atencion', imports: [RouterLink, ReactiveFormsModule], templateUrl: './cancelar-atencion.html' })
export class CancelarAtencion {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly atencion = signal<AtencionResponse | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly confirmar = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({ observaciones: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(250)]] });
  constructor() {
    this.route.paramMap.pipe(tap(() => { this.atencion.set(null); this.error.set(''); this.mensaje.set(''); this.confirmar.set(false); this.form.reset(); this.cargando.set(true); }),
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!Number.isSafeInteger(id) || id < 1) { this.error.set('El identificador de la atención no es válido.'); return of(null); }
        return this.api.get<AtencionResponse>(`atenciones/${id}`).pipe(catchError(e => { this.error.set(e.status === 404 ? 'La atención no existe.' : 'No se pudo cargar la atención. Vuelve al listado e intenta nuevamente.'); return of(null); }));
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe(a => { this.atencion.set(a); this.cargando.set(false); });
  }
  revisar() {
    if (this.guardando() || this.atencion()?.estado !== 'PROGRAMADA') return;
    this.form.markAllAsTouched();
    if (this.form.valid) this.confirmar.set(true);
  }
  cancelar() {
    const a = this.atencion();
    if (!a || a.estado !== 'PROGRAMADA' || this.guardando() || !this.confirmar() || this.form.invalid) return;
    this.guardando.set(true); this.error.set('');
    this.api.patch<AtencionResponse>(`atenciones/${a.idAtencion}/cancelar`, { observaciones: this.form.getRawValue().observaciones.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: actualizada => { this.atencion.set(actualizada); this.guardando.set(false); this.confirmar.set(false); this.mensaje.set('Atención cancelada correctamente.'); },
        error: e => { this.guardando.set(false); this.confirmar.set(false); this.error.set(e.status === 400 ? (e.error?.message || 'Revisa el motivo y el estado de la atención.') : 'No se pudo confirmar la cancelación. Consulta el listado antes de intentarlo nuevamente.'); },
      });
  }
}
