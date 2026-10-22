import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Auth } from '../../../core/auth/auth';
import { PortalPreferencias } from '../../../core/services/portal-preferencias';

@Component({ selector: 'app-opciones-cliente', imports: [ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule], templateUrl: './opciones.html' })
export class OpcionesCliente {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly preferencias = inject(PortalPreferencias);
  readonly pagina = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly guardando = signal(false);
  readonly clave = this.fb.nonNullable.group({ actual: ['', Validators.required], nueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(/\S/)]], confirmacion: ['', Validators.required] }, { validators: (c: AbstractControl) => c.get('nueva')?.value === c.get('confirmacion')?.value ? null : { distintas: true } });
  readonly ajustes = this.fb.nonNullable.group({ formato: ['dd/MM/yyyy'], citasEstado: ['TODAS'] });
  constructor() {
    effect(() => {
      const formato = this.preferencias.formato(); const citasEstado = this.preferencias.citasEstado();
      if (!this.ajustes.dirty) this.ajustes.patchValue({ formato, citasEstado });
    });
    inject(ActivatedRoute).data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.pagina.set(data['pagina']); this.error.set(''); this.mensaje.set(''); this.clave.reset();
      this.ajustes.setValue({ formato: this.preferencias.formato(), citasEstado: this.preferencias.citasEstado() }); this.ajustes.markAsPristine();
    });
  }
  guardarPreferencias() {
    const v = this.ajustes.getRawValue();
    try { this.preferencias.guardar(v.formato, v.citasEstado); this.mensaje.set('Preferencias guardadas en este navegador.'); this.error.set(''); }
    catch { this.error.set('Este navegador no permite guardar preferencias.'); }
  }
  cambiarClave() {
    if (this.guardando()) return;
    this.clave.markAllAsTouched(); this.error.set('');
    if (this.clave.invalid) { this.error.set('Completa la contraseña actual y confirma una nueva de entre 8 y 72 caracteres.'); return; }
    const { actual, nueva } = this.clave.getRawValue();
    if (new TextEncoder().encode(nueva).length > 72) { this.error.set('La nueva contraseña supera la longitud admitida. Reduce su tamaño.'); return; }
    this.guardando.set(true);
    this.api.patch<void>('cuenta/clave', { actual, nueva }).pipe(
      switchMap(() => this.auth.logout().pipe(catchError(() => of(null)))), takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: () => { this.auth.clearSession(); this.clave.reset(); void this.router.navigate(['/login'], { state: { claveActualizada: true } }); }, error: e => { this.guardando.set(false); this.error.set(e.status === 400 ? (e.error?.message || 'Revisa los datos ingresados.') : 'No se pudo confirmar el cambio de contraseña.'); } });
  }
}
