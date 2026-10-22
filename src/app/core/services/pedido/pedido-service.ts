import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { PedidoResponse, PedidoRequest, DetallePedidoResponse } from '../../models/PedidoModel';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly api = inject(ApiService);
  misPedidos() { return this.api.get<PedidoResponse[]>('pedidos/mis-pedidos'); }
  cancelarPropio(id: number, observacion: string) { return this.api.patch<PedidoResponse>(`pedidos/mis-pedidos/${id}/cancelar`, { observacion }); }
  miPedido(id: number) { return this.api.get<PedidoResponse>(`pedidos/mis-pedidos/${id}`); }
  crear(request: PedidoRequest) { return this.api.post<PedidoResponse>('pedidos', request); }
  detallesPropios(id: number) { return this.api.get<DetallePedidoResponse[]>(`pedidos/${id}/detalles`); }
}
