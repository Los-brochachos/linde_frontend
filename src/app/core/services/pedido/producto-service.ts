import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { ProductoResponse } from '../../models/ProductoModel';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly api = inject(ApiService);
  activos() { return this.api.get<ProductoResponse[]>('productos/activos'); }
}
