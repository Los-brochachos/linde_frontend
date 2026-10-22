import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../../core/auth/auth';
import { ClienteService } from '../../../core/services/cliente/cliente-service';
import { ClienteResponse } from '../../../core/models/ClienteModel';

@Component({ selector: 'app-perfil-cliente', imports: [ReactiveFormsModule, InputTextModule, InputMaskModule, ButtonModule], templateUrl: './perfil-cliente.html' })
export class PerfilCliente {
  private readonly service = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = inject(Auth).usuario;
  readonly cliente = signal<ClienteResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({ ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], razonSocial: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]], telefono: ['', Validators.pattern(/^(?:[1-8]\d{7}|9\d{8})$/)], direccion: ['', Validators.maxLength(150)] });
  constructor() { this.cargar(); }
  cargar() {
    if (this.loading() || this.saving()) return;
    this.loading.set(true); this.error.set('');
    this.service.me().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: c => { this.cliente.set(c); this.restaurar(); this.loading.set(false); }, error: () => { this.error.set('No se pudo cargar tu perfil. Intenta nuevamente.'); this.loading.set(false); } });
  }
  restaurar() {
    const c = this.cliente(); if (!c) return;
    let telefono = (c.telefono || '').replace(/\D/g, '');
    if (telefono.startsWith('51') && [10, 11].includes(telefono.length)) telefono = telefono.slice(2);
    if (telefono.startsWith('0') && telefono.length === 9) telefono = telefono.slice(1);
    this.form.reset({ ruc: c.ruc, razonSocial: c.razonSocial, telefono, direccion: c.direccion || '' }); this.editando.set(false);
  }
  guardar() {
    if (!this.editando() || this.saving()) return;
    this.error.set(''); this.mensaje.set(''); const v = this.form.getRawValue();
    this.form.patchValue({ razonSocial: v.razonSocial.trim(), direccion: v.direccion.trim() }); this.form.markAllAsTouched();
    if (this.form.invalid) { this.error.set('Revisa el RUC, la razón social y el teléfono antes de guardar.'); return; }
    this.saving.set(true);
    this.service.actualizarMe(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: c => { this.cliente.set(c); this.restaurar(); this.saving.set(false); this.mensaje.set('Perfil actualizado correctamente.'); },
      error: e => { this.saving.set(false); this.error.set(e.status === 400 ? (e.error?.message || 'Revisa los datos del perfil.') : 'No se pudo confirmar la actualización. Actualiza el perfil antes de intentarlo nuevamente.'); },
    });
  }
}
