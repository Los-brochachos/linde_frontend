import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/auth.service';
import { API_URL, Producto } from '../core/api';

@Component({
  imports: [ButtonModule, DecimalPipe],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <header class="border-b border-slate-200 bg-white px-6 py-5">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span class="text-2xl font-semibold text-sky-900">Linde.</span>
          <div class="flex items-center gap-4"><span class="text-sm text-slate-500">{{ auth.usuario()?.correo }}</span>
            <p-button label="Cerrar sesión" severity="secondary" [outlined]="true" (onClick)="auth.logout()" />
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 py-10">
        <p class="text-sm uppercase tracking-widest text-sky-700">Panel de operaciones</p>
        <h1 class="mt-2 text-3xl font-semibold">Bienvenido a Linde</h1>
        <p class="mt-3 text-slate-500">Tu sesión está activa como {{ auth.usuario()?.rol }}.</p>
        @if (canReadProducts) {
          <section class="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div class="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
              <div><h2 class="text-lg font-semibold">Catálogo de productos</h2>
                <p class="mt-1 text-sm text-slate-500">Gases disponibles para los pedidos.</p></div>
              <p-button label="Actualizar" [outlined]="true" [loading]="loading()" (onClick)="load()" />
            </div>
            @if (error()) { <p role="alert" class="p-6 text-red-700">{{ error() }}</p> }
            @else if (loading()) { <p role="status" class="p-6 text-slate-500">Cargando productos…</p> }
            @else {
              <div class="overflow-x-auto"><table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500"><tr><th class="px-6 py-4">Producto</th><th class="px-6 py-4">Tipo de gas</th><th class="px-6 py-4">Unidad</th><th class="px-6 py-4 text-right">Precio unitario</th></tr></thead>
                <tbody>@for (producto of productos(); track producto.idProducto) {
                  <tr class="border-t border-slate-100"><td class="px-6 py-4 font-medium">{{ producto.nombre }}</td><td class="px-6 py-4">{{ producto.tipoGas }}</td><td class="px-6 py-4">{{ producto.unidadMedida }}</td><td class="px-6 py-4 text-right">{{ producto.precioUnitario | number:'1.2-2' }}</td></tr>
                } @empty { <tr><td colspan="4" class="p-6 text-slate-500">No hay productos activos.</td></tr> }</tbody>
              </table></div>
            }
          </section>
        } @else {
          <section class="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <h2 class="text-lg font-semibold">Mi cuenta</h2><p class="mt-3 text-slate-500">{{ auth.usuario()?.correo }}</p>
            <p class="mt-2 text-sm text-slate-500">Estado: {{ auth.usuario()?.estado }}</p>
          </section>
        }
      </main>
    </div>`,
})
export class Dashboard {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_URL);
  readonly productos = signal<Producto[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly canReadProducts = ['ADMIN', 'ANALISTA', 'PROGRAMADOR', 'CLIENTE'].includes(this.auth.usuario()?.rol ?? '');
  constructor() { if (this.canReadProducts) this.load(); }
  load(): void {
    if (!this.canReadProducts || this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.http.get<Producto[]>(`${this.base}/api/v1/productos/activos`)
      .pipe(finalize(() => this.loading.set(false))).subscribe({
        next: products => this.productos.set(products),
        error: () => this.error.set('No se pudo cargar el catálogo. Inténtalo de nuevo.'),
      });
  }
}
