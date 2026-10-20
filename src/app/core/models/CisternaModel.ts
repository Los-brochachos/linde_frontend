export interface CisternaResponse {
  idCisterna: number;
  placa: string;
  nombre: string;
  capacidad: number;
  estado: string;
}

export interface FallaResponse {
  idFalla: number;
  descripcion: string;
  fechaHora: string;
  estado: string;
  idCisterna: number;
  idTrabajador: number;
}

export interface HistorialMantenimientoResponse {
  idHistorial: number;
  fecha: string;
  descripcion: string;
  resultado: string;
  observaciones?: string;
  costo: number;
  idCisterna: number;
  idFalla: number;
  idTecnico: number;
}
