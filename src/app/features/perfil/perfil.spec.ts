import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, afterEach } from 'vitest';
import { Auth } from '../../core/auth/auth';
import { Perfil } from './perfil';

describe('Mi perfil', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [Perfil], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    const fixture = TestBed.createComponent(Perfil);
    return { fixture, http: TestBed.inject(HttpTestingController), auth: TestBed.inject(Auth) };
  }
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });
  it('consulta el usuario autenticado y después sus datos de cliente', async () => {
    const { fixture, http, auth } = await setup();
    http.expectOne(request => request.url.endsWith('/usuarios/me')).flush({ idUsuario: 2, correo: 'cliente@example.com', rol: 'CLIENTE', estado: 'ACTIVO' });
    http.expectOne(request => request.url.endsWith('/clientes/me')).flush({ razonSocial: 'Empresa de prueba', ruc: '20123456789' });
    fixture.detectChanges();
    expect(auth.usuario()?.correo).toBe('cliente@example.com');
    expect(fixture.nativeElement.textContent).toContain('Empresa de prueba');
    expect(fixture.nativeElement.textContent).toContain('20123456789');
  });
  it('admin consulta su cuenta sin pedir el perfil de otro rol', async () => {
    const { fixture, http } = await setup();
    http.expectOne(request => request.url.endsWith('/usuarios/me')).flush({ idUsuario: 1, correo: 'admin@example.com', rol: 'ADMIN', estado: 'ACTIVO' });
    expect(http.match(() => true)).toHaveLength(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('admin@example.com');
  });
  it('una sesión vencida muestra el error y permite reintentar', async () => {
    const { fixture, http } = await setup();
    http.expectOne(request => request.url.endsWith('/usuarios/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Tu sesión ha vencido');
    fixture.componentInstance.load();
    http.expectOne(request => request.url.endsWith('/usuarios/me')).flush({ idUsuario: 1, correo: 'admin@example.com', rol: 'ADMIN', estado: 'ACTIVO' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
