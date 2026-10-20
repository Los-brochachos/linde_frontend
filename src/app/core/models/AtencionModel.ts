export interface AtencionResponse {
  idAtencion: number;
  fechaInicioProgramada: string;
  fechaFinProgramada: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  observaciones: string | null;
  idPedido: number;
  idConductor: number;
  idCisterna: number;
  idProgramador: number;
}
