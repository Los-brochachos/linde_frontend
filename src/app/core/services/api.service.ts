import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Auth } from '../auth/auth';
import { environment } from '../../../environments/environment';

// Único punto para consultas de negocio: Bearer en memoria, sin leer cookies.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  get<T>(path: string) {
    return this.http.get<T>(`${environment.apiUrl}/api/v1/${path}`, {
      headers: { Authorization: `Bearer ${this.auth.getAccessToken()}` },
    });
  }
  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${environment.apiUrl}/api/v1/${path}`, body, {
      headers: { Authorization: `Bearer ${this.auth.getAccessToken()}` },
    });
  }
  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${environment.apiUrl}/api/v1/${path}`, body, {
      headers: { Authorization: `Bearer ${this.auth.getAccessToken()}` },
    });
  }
}
