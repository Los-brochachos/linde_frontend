import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, afterEach } from 'vitest';
import { Dashboard } from './dashboard';
import { Auth } from '../../core/auth/auth';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('Dashboard según los permisos del backend', () => {
  const expected: Record<string, string[]> = {
    CLIENTE: ['pedidos/mis-pedidos', 'productos/activos'],
    CONDUCTOR: ['atenciones', 'alertas'],
    TECNICO: ['fallas', 'historial', 'cisternas/activas', 'atenciones'],
    PROGRAMADOR: ['pedidos', 'atenciones', 'alertas', 'conductores/activos', 'cisternas/activas', 'productos/activos'],
    ADMIN: ['pedidos', 'usuarios', 'clientes', 'atenciones', 'alertas', 'fallas', 'productos/activos', 'cisternas/activas', 'conductores/activos', 'historial'],
    ANALISTA: ['pedidos', 'clientes', 'atenciones', 'alertas', 'fallas', 'productos/activos', 'cisternas/activas', 'conductores/activos', 'usuarios', 'historial'],
  };

  async function setup(rol: string) {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } }, {
        provide: Auth,
        useValue: { usuario: signal({ rol, correo: 'prueba@example.com' }), getAccessToken: () => 'test-token' },
      }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    return { fixture, http: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });

  for (const [role, paths] of Object.entries(expected)) {
    it(`${role}: consulta solo los recursos autorizados y muestra sus secciones`, async () => {
      const { fixture, http } = await setup(role);
      const requests = http.match(() => true);
      expect(requests.map(request => request.request.url.split('/api/v1/')[1])).toEqual(paths);
      requests.forEach(request => {
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush([]);
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('[aria-pressed]').length).toBe(paths.length);
      expect(fixture.nativeElement.textContent).toContain('No hay registros disponibles.');
    });
  }

  it('un rol desconocido no consulta datos de otros roles', async () => {
    const { fixture, http } = await setup('DESCONOCIDO');
    expect(http.match(() => true)).toHaveLength(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay una vista disponible para tu rol.');
  });

  it('busca en los registros y pagina sin ocultar los resultados restantes', async () => {
    const { fixture, http } = await setup('CLIENTE');
    const requests = http.match(() => true);
    requests[0].flush(Array.from({ length: 12 }, (_, index) => ({ idPedido: index + 1, estado: index === 11 ? 'ENTREGADO' : 'RECIBIDO' })));
    requests[1].flush([]);
    expect(fixture.componentInstance.visible()).toHaveLength(10);
    fixture.componentInstance.page.set(1);
    expect(fixture.componentInstance.visible()).toHaveLength(2);
    fixture.componentInstance.filter('entregado');
    expect(fixture.componentInstance.page()).toBe(0);
    expect(fixture.componentInstance.filtered()).toHaveLength(1);
    fixture.componentInstance.filter('sin coincidencias');
    expect(fixture.componentInstance.filtered()).toHaveLength(0);
  });

  it('selecciona la sección indicada por la barra lateral y rechaza secciones ajenas', async () => {
    const { fixture, http } = await setup('CLIENTE');
    http.match(() => true).forEach(request => request.flush([]));
    const route = TestBed.inject(ActivatedRoute);
    // Se comprueba la suscripción con una nueva instancia en la misma sesión.
    Object.assign(route, { queryParamMap: of(convertToParamMap({ seccion: 'productos' })) });
    const second = TestBed.createComponent(Dashboard);
    http.match(() => true).forEach(request => request.flush([]));
    expect(second.componentInstance.active()).toBe('productos');
    second.destroy();
    Object.assign(route, { queryParamMap: of(convertToParamMap({ seccion: 'usuarios' })) });
    const third = TestBed.createComponent(Dashboard);
    http.match(() => true).forEach(request => request.flush([]));
    expect(third.componentInstance.active()).toBe('pedidos');
    third.destroy();
  });

  it('distingue un error de permisos de una lista vacía y permite reintentar', async () => {
    const { fixture, http } = await setup('CLIENTE');
    const requests = http.match(() => true);
    requests[0].flush({}, { status: 403, statusText: 'Forbidden' });
    requests[1].flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No tienes permiso');
    fixture.componentInstance.reload();
    http.match(() => true).forEach(request => request.flush([{ idPedido: 42, estado: 'RECIBIDO' }]));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('RECIBIDO');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
