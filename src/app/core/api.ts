import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root', factory: () => 'http://localhost:8080',
});
export type Rol = 'ADMIN' | 'ANALISTA' | 'CLIENTE' | 'PROGRAMADOR' | 'CONDUCTOR' | 'TECNICO';
export interface Usuario { idUsuario: number; correo: string; estado: 'ACTIVO' | 'INACTIVO'; rol: Rol; }
export interface Tokens { access_token: string; refresh_token: string; }
export interface Producto {
  idProducto: number; nombre: string; tipoGas: string; unidadMedida: string;
  precioUnitario: number; estado: 'ACTIVO' | 'INACTIVO';
}
