import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { TrabajadorResponse, TrabajadorDatos, TrabajadorRegistro } from '../../models/TrabajadorModel';

@Injectable({ providedIn: 'root' })
export class TrabajadorService {
  private readonly api = inject(ApiService);
  buscar(id: number) { return this.api.get<TrabajadorResponse>(`trabajadores/${id}`); }
  listar() { return this.api.get<TrabajadorResponse[]>('trabajadores'); }
  crear(request: TrabajadorRegistro) {
    const rutas: Record<string, string> = { CONDUCTOR: 'conductores', PROGRAMADOR: 'programadores', TECNICO: 'tecnicos' };
    return this.api.post<TrabajadorResponse>(rutas[request.rol] || 'trabajadores', request);
  }
  actualizar(id: number, request: TrabajadorDatos) { return this.api.put<TrabajadorResponse>(`trabajadores/${id}`, request); }
  desactivar(id: number) { return this.api.delete<TrabajadorResponse>(`trabajadores/${id}`); }
  activar(id: number) { return this.api.patch<TrabajadorResponse>(`trabajadores/${id}/activar`, {}); }
}
