import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { ClienteService } from '../../../core/services/cliente/cliente-service';

@Component({ selector: 'app-register', imports: [ReactiveFormsModule, RouterLink, InputTextModule, InputMaskModule, ButtonModule], templateUrl: './register.html' })
export class Register {
  private readonly clientes = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  readonly guardando = signal(false);
  readonly registrado = signal(false);
  readonly error = signal('');
  readonly mostrarClave = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    direccion: ['', Validators.maxLength(150)],
    telefono: ['', Validators.pattern(/^(?:[1-8]\d{7}|9\d{8})$/)],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    contraseña: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(/\S/)]],
    confirmarContraseña: ['', Validators.required],
  }, { validators: (control: AbstractControl) => control.get('contraseña')?.value === control.get('confirmarContraseña')?.value ? null : { clavesDistintas: true } });
  readonly campos = [
    { key: 'ruc', label: 'RUC', type: 'text', autocomplete: 'off', max: 11, placeholder: '11 dígitos', required: true },
    { key: 'razonSocial', label: 'Razón social', type: 'text', autocomplete: 'organization', max: 100, placeholder: 'Nombre de la empresa', required: true },
    { key: 'direccion', label: 'Dirección', type: 'text', autocomplete: 'street-address', max: 150, placeholder: 'Dirección de la empresa', required: false },
    { key: 'telefono', label: 'Teléfono', type: 'tel', autocomplete: 'tel', max: 11, placeholder: '987 654 321', required: false },
    { key: 'correo', label: 'Correo electrónico', type: 'email', autocomplete: 'email', max: 100, placeholder: 'correo@empresa.com', required: true },
  ] as const;
  invalido(campo: string) { const c = this.form.get(campo); return !!c?.touched && !!c.invalid; }
  mensaje(campo: string): string {
    const c = this.form.get(campo);
    if (c?.hasError('server')) return c.getError('server');
    if (c?.hasError('required')) return 'Este campo es obligatorio.';
    if (campo === 'ruc') return 'El RUC debe contener exactamente 11 dígitos.';
    if (campo === 'telefono') return 'Ingresa un fijo de 8 dígitos con código de área, o un celular de 9 dígitos que comience con 9. Sin +51 ni cero inicial.';
    if (campo === 'correo' && c?.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (campo === 'contraseña') return 'La contraseña debe tener entre 8 y 100 caracteres y no contener solo espacios.';
    if (campo === 'razonSocial' && c?.hasError('pattern')) return 'Ingresa la razón social.';
    return 'El texto supera la longitud permitida.';
  }
  registrar() {
    if (this.guardando() || this.registrado()) return;
    this.error.set('');
    const datos = this.form.getRawValue();
    this.form.patchValue({ ruc: datos.ruc.trim(), razonSocial: datos.razonSocial.trim(), direccion: datos.direccion.trim(), telefono: (datos.telefono ?? '').replace(/\s/g, ''), correo: datos.correo.trim() });
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error.set('Revisa los campos indicados antes de crear tu cuenta.'); return; }
    const { confirmarContraseña, ...request } = this.form.getRawValue();
    this.guardando.set(true);
    this.clientes.registrar(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.registrado.set(true); this.guardando.set(false); this.form.reset(); },
      error: respuesta => {
        this.guardando.set(false);
        if (respuesta.status === 400) {
          const detalles = respuesta.error?.details;
          if (detalles && typeof detalles === 'object') {
            for (const [campo, mensaje] of Object.entries(detalles)) {
              const c = this.form.get(campo);
              if (c && typeof mensaje === 'string') c.setErrors({ ...c.errors, server: mensaje });
            }
          }
          this.error.set(respuesta.error?.message || 'Revisa los datos de tu registro.');
        } else if (respuesta.status === 0) this.error.set('No se pudo conectar con el servidor. Intenta nuevamente.');
        else this.error.set('No se pudo confirmar el registro. Si ya creaste la cuenta, intenta iniciar sesión antes de repetirlo.');
      },
    });
  }
}
