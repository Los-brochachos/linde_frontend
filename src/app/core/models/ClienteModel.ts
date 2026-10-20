export interface ClienteCreateRequest {
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  correo: string;
  contraseña: string;
}

export interface ClienteResponse {
  idCliente: number;
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  correo: string;
  rol: string; // Corresponde a RolesEnum
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ClienteUpdateRequest {
  ruc?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  contraseña?: string;
}
