import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service, signal } from '@angular/core';
import { tap, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthRequest,
  AuthResponse,
  CsrfResponse,
  UsuarioActual
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly http = inject(HttpClient);

  // Estos valores existen solamente en memoria.
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private csrfHeaderName: string | null = null;

  private readonly usuarioState = signal<UsuarioActual| null>(null);
  readonly usuario = this.usuarioState.asReadonly();

  getCsrf() {
    return this.http.get<CsrfResponse>(
      `${environment.apiUrl}/auth/csrf`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(response => {
        this.csrfToken = response.token;
        this.csrfHeaderName = response.headerName;
      })
    );
  }


  login(request: AuthRequest) {

    if (!this.csrfToken || !this.csrfHeaderName) {
      throw new Error('CSRF no inicializado');
    }

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      request,
      {
        withCredentials: true,

        headers: {
          [this.csrfHeaderName]: this.csrfToken
        }
      }
    ).pipe(
      tap(response => {
        this.accessToken = response.access_token;
      })
    );
  }


  // El navegador envia el refresh HttpOnly; no se lee ni se manda en JSON.
  refreshSession() {
    return this.getCsrf().pipe(
      switchMap(() => this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, {}, {
        withCredentials: true,
        headers: { [this.csrfHeaderName!]: this.csrfToken! }
      })),
      tap(response => {this.accessToken = response.access_token}),
    
      switchMap(()=> this.cargarUsuario())
    );
  }

  getProfile() {
    return this.http.get<UsuarioActual>(`${environment.apiUrl}/api/v1/usuarios/me`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
  }

  getPedidos(rol: string) {
    const ruta = rol === 'CLIENTE' ? 'mis-pedidos' : '';
    return this.http.get<PedidoResumen[]>(`${environment.apiUrl}/api/v1/pedidos${ruta ? '/' + ruta : ''}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
  }

  logout() {
    return this.getCsrf().pipe(
      switchMap(() => this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, {
        withCredentials: true,
        headers: { [this.csrfHeaderName!]: this.csrfToken! }
      })),
      tap(() => this.clearSession())
    );
  }

  clearSession(): void { 
    this.accessToken = null; 
    this.usuarioState.set(null);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  cargarUsuario() {
    return this.getProfile().pipe(
    tap(usuario => this.usuarioState.set(usuario))
  );
}
}
export interface PedidoResumen {
  idPedido: number;
  estado: string;
  fechaRegistro: string;  
}