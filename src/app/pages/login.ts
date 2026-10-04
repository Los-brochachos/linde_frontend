import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../core/auth.service';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  template: `
    <main class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section class="hidden flex-col justify-between bg-sky-950 p-16 text-white lg:flex">
        <span class="text-3xl font-semibold tracking-tight">Linde<span class="text-sky-400">.</span></span>
        <div><p class="mb-5 text-sm uppercase tracking-widest text-sky-300">Gestión de operaciones</p>
          <h1 class="max-w-lg text-5xl font-semibold leading-tight">Cada entrega,<br>en buenas manos.</h1>
          <p class="mt-6 max-w-md text-lg text-slate-300">Pedidos, distribución y mantenimiento conectados en un solo lugar.</p>
        </div><p class="text-sm text-slate-400">Plataforma de gestión logística</p>
      </section>
      <section class="flex min-h-screen items-center justify-center px-6 py-12">
        <div class="w-full max-w-sm">
          <p class="mb-10 text-2xl font-semibold text-sky-900 lg:hidden">Linde.</p>
          <p class="text-sm font-medium uppercase tracking-widest text-sky-700">Bienvenido</p>
          <h2 class="mt-3 text-3xl font-semibold text-slate-900">Inicia sesión</h2>
          <p class="mb-8 mt-3 text-slate-500">Ingresa con tu cuenta para continuar.</p>
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div><label for="correo" class="mb-2 block text-sm font-medium">Correo electrónico</label>
              <input pInputText id="correo" type="email" formControlName="correo" autocomplete="username" class="w-full" />
              @if (form.controls.correo.touched && form.controls.correo.invalid) {
                <p class="mt-2 text-sm text-red-700">Ingresa un correo válido.</p>
              }
            </div>
            <div><label for="password" class="mb-2 block text-sm font-medium">Contraseña</label>
              <input pInputText id="password" type="password" formControlName="password" autocomplete="current-password" class="w-full" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <p class="mt-2 text-sm text-red-700">La contraseña es obligatoria.</p>
              }
            </div>
            @if (error()) { <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-800">{{ error() }}</p> }
            <p-button type="submit" label="Ingresar" [loading]="loading()" [disabled]="loading()" styleClass="w-full" />
          </form>
        </div>
      </section>
    </main>`,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = inject(FormBuilder).nonNullable.group({
    correo: ['', [Validators.required, Validators.email]], password: ['', Validators.required],
  });
  readonly loading = signal(false);
  readonly error = signal('');
  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    const { correo, password } = this.form.getRawValue();
    this.auth.login(correo.trim(), password).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => { void this.router.navigateByUrl('/'); },
      error: error => this.error.set(error.status === 0 ? 'No se pudo conectar con el servidor.'
        : 'No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.'),
    });
  }
}
