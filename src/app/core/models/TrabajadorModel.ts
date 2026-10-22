export type RolTrabajador = 'ADMIN' | 'ANALISTA' | 'PROGRAMADOR' | 'CONDUCTOR' | 'TECNICO';
export interface TrabajadorResponse {
  idTrabajador: number; nombres: string; apellidos: string; dni: string;
  telefono: string | null; direccion: string | null; fechaIngreso: string;
  estado: 'ACTIVO' | 'INACTIVO'; correo: string; rol: RolTrabajador;
}
export interface TrabajadorDatos {
  nombres: string; apellidos: string; dni: string; telefono: string; direccion: string; fechaIngreso: string;
}
export interface TrabajadorRegistro extends TrabajadorDatos {
  correo: string; contraseña: string; rol: RolTrabajador;
  licenciaConducir?: string; categoriaLicencia?: string; fechaVencimientoLicencia?: string;
  turno?: string; nivelIngles?: string; especialidad?: string; nivelTecnico?: string;
}
