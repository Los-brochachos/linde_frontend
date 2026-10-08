import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from './auth';
import { environment } from '../../../environments/environment';

describe('Auth', () => {
  let service: Auth;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('recupera el access usando cookies y el encabezado CSRF, sin enviar refresh en JSON', () => {
    service.refreshSession().subscribe();
    const csrf = http.expectOne(`${environment.apiUrl}/auth/csrf`);
    expect(csrf.request.withCredentials).toBe(true);
    csrf.flush({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' });
    const refresh = http.expectOne(`${environment.apiUrl}/auth/refresh-token`);
    expect(refresh.request.withCredentials).toBe(true);
    expect(refresh.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-value');
    expect(refresh.request.body).toEqual({});
    refresh.flush({ access_token: 'new-access' });
    expect(service.getAccessToken()).toBe('new-access');
    service.getProfile().subscribe();
    const profile = http.expectOne(`${environment.apiUrl}/api/v1/usuarios/me`);
    expect(profile.request.headers.get('Authorization')).toBe('Bearer new-access');
    profile.flush({ correo: 'admin@linde.example', rol: 'ADMIN' });
  });

  it('consulta mis-pedidos para cliente y el listado general para admin', () => {
    service.getPedidos('CLIENTE').subscribe();
    http.expectOne(`${environment.apiUrl}/api/v1/pedidos/mis-pedidos`).flush([]);
    service.getPedidos('ADMIN').subscribe();
    http.expectOne(`${environment.apiUrl}/api/v1/pedidos`).flush([]);
  });

  it('limpia la memoria solo cuando el servidor confirma logout', () => {
    service.refreshSession().subscribe();
    http.expectOne(`${environment.apiUrl}/auth/csrf`).flush({ token: 'csrf', headerName: 'X-XSRF-TOKEN' });
    http.expectOne(`${environment.apiUrl}/auth/refresh-token`).flush({ access_token: 'access' });
    service.logout().subscribe();
    http.expectOne(`${environment.apiUrl}/auth/csrf`).flush({ token: 'csrf', headerName: 'X-XSRF-TOKEN' });
    const logout = http.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(service.getAccessToken()).toBe('access');
    expect(logout.request.withCredentials).toBe(true);
    logout.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.getAccessToken()).toBeNull();
  });
});
