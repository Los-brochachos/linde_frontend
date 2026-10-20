import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { CisternaResponse } from '../../models/CisternaModel';

@Injectable({ providedIn: 'root' })
export class CisternaService {
  private readonly api = inject(ApiService);
  activas() { return this.api.get<CisternaResponse[]>('cisternas/activas'); }
}
