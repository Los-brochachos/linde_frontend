export interface DetallePedidoRequest {
  cantidad: number;
  idProducto: number;
}

export interface PedidoRequest {
  fechaEntregaEstimada: string;
  prioridad: string;

  detalles: DetallePedidoRequest[];
}

export interface PedidoResponse {
  idPedido: number;
  fechaRegistro: string;
  estado: string;
  fechaEntregaEstimada: string;
  prioridad: string;
  idCliente: number;
  razonSocial?: string;
}

export interface DetallePedidoResponse {
  idDetalle: number;
  cantidad: number;
  precioUnitario: number;
  estado: string;
  idProducto: number;
  nombreProducto: string;
}

export interface SeguimientoPedidoResponse {
  idSeguimiento: number;
  fechaHora: string;
  estado: string;
  observacion?: string;
  idPedido: number;
}
