import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PedidoService } from '../../../core/services/pedido/pedido-service';
import { ProductoService } from '../../../core/services/pedido/producto-service';
import { ProductoResponse } from '../../../core/models/ProductoModel';

@Component({ selector: 'app-nuevo-pedido', imports: [ReactiveFormsModule, RouterLink, InputTextModule], templateUrl: './nuevo-pedido.html' })
export class NuevoPedido {
  private readonly fb = inject(FormBuilder);
  private readonly pedidos = inject(PedidoService);
  private readonly catalogo = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly productos = signal<ProductoResponse[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorCatalogo = signal('');
  readonly error = signal('');
  readonly enviado = signal(false);
  readonly creado = signal<number | null>(null);
  readonly form = this.fb.group({
    fechaEntregaEstimada: ['', Validators.required],
    prioridad: ['', Validators.required],
    detalles: this.fb.array([this.linea()]),
  });
  get detalles() { return this.form.controls.detalles; }
  constructor() { this.cargarProductos(); }
  private linea() {
    return this.fb.group({
      idProducto: this.fb.control<number | null>(null, Validators.required),
      cantidad: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(99999999.99), Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    });
  }
  cargarProductos() {
    this.cargando.set(true); this.errorCatalogo.set('');
    this.catalogo.activos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: productos => { this.productos.set(productos); this.cargando.set(false); },
      error: () => { this.errorCatalogo.set('No se pudieron cargar los productos. Intenta nuevamente.'); this.cargando.set(false); },
    });
  }
  agregar() { this.detalles.push(this.linea()); }
  quitar(i: number) { if (this.detalles.length > 1) this.detalles.removeAt(i); }
  ocupado(id: number, indice: number) { return this.detalles.controls.some((linea, i) => i !== indice && linea.controls.idProducto.value === id); }
  guardar() {
    if (this.guardando() || this.creado() || this.cargando() || this.errorCatalogo() || !this.productos().length) return;
    this.enviado.set(true); this.error.set(''); this.form.markAllAsTouched();
    if (this.form.invalid) { this.error.set('Completa los campos obligatorios y revisa las cantidades.'); return; }
    const datos = this.form.getRawValue();
    const ids = datos.detalles.map(d => d.idProducto);
    if (new Set(ids).size !== ids.length) { this.error.set('Un producto no puede repetirse dentro del mismo pedido.'); return; }
    if (ids.some(id => !this.productos().some(p => p.idProducto === id))) { this.error.set('Selecciona productos disponibles en el catálogo.'); return; }
    this.guardando.set(true);
    this.pedidos.crear({ fechaEntregaEstimada: datos.fechaEntregaEstimada!, prioridad: datos.prioridad!, detalles: datos.detalles.map(d => ({ idProducto: d.idProducto!, cantidad: d.cantidad! })) })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: pedido => {
          this.creado.set(pedido.idPedido); this.guardando.set(false);
          void this.router.navigate(['/cliente/pedidos', pedido.idPedido], { state: { pedidoCreado: pedido.idPedido } });
        },
        error: respuesta => {
          this.guardando.set(false);
          const detalles = respuesta.error?.details;
          this.error.set(respuesta.status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.'
            : respuesta.status === 403 ? 'No tienes permiso para registrar pedidos.'
            : respuesta.status === 400 ? (respuesta.error?.message || (detalles && Object.values(detalles).join('. ')) || 'Revisa los datos del pedido.')
            : 'No se pudo confirmar el registro. Consulta Mis pedidos antes de volver a enviarlo.');
        },
      });
  }
}
