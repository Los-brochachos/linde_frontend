import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { API_URL, Tokens, Usuario } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = inject(API_URL);
  private readonly key = 'linde.session';
  readonly usuario = signal<Usuario | null>(null);
  private readonly tokens = signal<Tokens | null>(this.restore());

  private restore(): Tokens | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(this.key) ?? 'null');
      return typeof value?.access_token === 'string' && typeof value?.refresh_token === 'string' ? value : null;
    } catch { return null; }
  }
  accessToken(): string | null { return this.tokens()?.access_token ?? null; }
  private save(tokens: Tokens): void {
    this.tokens.set(tokens);
    sessionStorage.setItem(this.key, JSON.stringify(tokens));
  }
  login(correo: string, password: string) {
    return this.http.post<Tokens>(`${this.base}/auth/login`, { correo, contraseña: password }).pipe(
      tap(tokens => this.save(tokens)),
      switchMap(() => this.profile()),
      catchError(error => { this.clear(); throw error; }),
    );
  }
  private profile() {
    return this.http.get<Usuario>(`${this.base}/api/v1/usuarios/me`).pipe(tap(user => this.usuario.set(user)));
  }
  ensureSession() {
    if (!this.accessToken()) return of(null);
    return this.profile().pipe(catchError(() => { this.clear(); return of(null); }));
  }
  clear(): void {
    this.tokens.set(null);
    this.usuario.set(null);
    sessionStorage.removeItem(this.key);
  }
  logout(): void { this.clear(); void this.router.navigateByUrl('/login'); }
}
