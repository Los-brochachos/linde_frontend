import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('Backend authentication contract', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('sends the Spanish credentials and loads the profile with the access token', () => {
    auth.login('admin@linde.example', 'clave').subscribe(user => expect(user.rol).toBe('ADMIN'));
    const login = http.expectOne('http://localhost:8080/auth/login');
    expect(login.request.body).toEqual({ correo: 'admin@linde.example', contraseña: 'clave' });
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ access_token: 'access', refresh_token: 'refresh' });
    const profile = http.expectOne('http://localhost:8080/api/v1/usuarios/me');
    expect(profile.request.headers.get('Authorization')).toBe('Bearer access');
    profile.flush({ idUsuario: 1, correo: 'admin@linde.example', estado: 'ACTIVO', rol: 'ADMIN' });
    expect(auth.usuario()?.idUsuario).toBe(1);
  });

  it('clears a session if the profile cannot be loaded after login', () => {
    auth.login('admin@linde.example', 'clave').subscribe({ error: () => {} });
    http.expectOne('http://localhost:8080/auth/login').flush({ access_token: 'access', refresh_token: 'refresh' });
    http.expectOne('http://localhost:8080/api/v1/usuarios/me').flush({}, { status: 500, statusText: 'Error' });
    expect(auth.accessToken()).toBeNull();
    expect(sessionStorage.getItem('linde.session')).toBeNull();
  });

  it('does not send stored credentials to another origin', () => {
    auth.login('admin@linde.example', 'clave').subscribe();
    http.expectOne('http://localhost:8080/auth/login').flush({ access_token: 'access', refresh_token: 'refresh' });
    http.expectOne('http://localhost:8080/api/v1/usuarios/me').flush({ idUsuario: 1, rol: 'ADMIN' });
    TestBed.inject(HttpClient).get('https://example.com/api/v1/usuarios/me').subscribe();
    const external = http.expectOne('https://example.com/api/v1/usuarios/me');
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush({});
  });
});
