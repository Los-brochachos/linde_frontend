import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ProductoService } from '../../../core/services/pedido/producto-service';
import { ProductoResponse } from '../../../core/models/ProductoModel';

@Component({ selector: 'app-productos-cliente', imports: [RouterLink, DecimalPipe, InputTextModule], templateUrl: './productos-cliente.html' })
export class ProductosCliente {
  private readonly service = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly productos = signal<ProductoResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly visibles = computed(() => { const q = this.busqueda().trim().toLocaleLowerCase(); return this.productos().filter(p => [p.nombre, p.tipoGas, p.unidadMedida].some(v => v.toLocaleLowerCase().includes(q))); });
  constructor() { this.cargar(); }
  cargar() {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.service.activos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: p => { this.productos.set(p); this.loading.set(false); }, error: () => { this.error.set('No se pudo cargar el catálogo. Intenta nuevamente.'); this.loading.set(false); } });
  }
}
