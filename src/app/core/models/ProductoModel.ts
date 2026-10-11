export interface ProductoCreateRequest {
  nombre: string;
  tipoGas: string;
  unidadMedida: string;
  precioUnitario: number;
}

export interface ProductoResponse {
  idProducto: number;
  nombre: string;
  tipoGas: string;
  unidadMedida: string;
  precioUnitario: number;
  estado: string;
}
