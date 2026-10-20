import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { ClienteResponse } from '../../models/ClienteModel';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = inject(ApiService);
  me() { return this.api.get<ClienteResponse>('clientes/me'); }
}
