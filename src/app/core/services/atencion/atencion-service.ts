import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { AtencionResponse } from '../../models/AtencionModel';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly api = inject(ApiService);
  misAtenciones() { return this.api.get<AtencionResponse[]>('atenciones/mis-atenciones'); }
}
