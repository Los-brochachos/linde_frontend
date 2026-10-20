import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { describe, it, expect, afterEach } from 'vitest';
import { Dashboard } from './dashboard';
import { Auth } from '../../core/auth/auth';

describe('Resumen del dashboard por rol', () => {
  const expected: Record<string, string[]> = {
    CONDUCTOR: ['atenciones', 'alertas'],
    TECNICO: ['fallas', 'historial', 'cisternas/activas', 'atenciones'],
    PROGRAMADOR: ['pedidos', 'atenciones', 'alertas', 'conductores/activos', 'cisternas/activas', 'productos/activos'],
    ADMIN: ['pedidos', 'usuarios', 'clientes', 'atenciones', 'alertas', 'fallas', 'productos/activos', 'cisternas/activas', 'conductores/activos', 'historial'],
    ANALISTA: ['pedidos', 'clientes', 'atenciones', 'alertas', 'fallas', 'productos/activos', 'cisternas/activas', 'conductores/activos', 'usuarios', 'historial'],
  };
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });
  for (const [role, paths] of Object.entries(expected)) {
    it(`${role}: consulta solo sus recursos y enlaza a pantallas por módulo`, async () => {
      await TestBed.configureTestingModule({ imports: [Dashboard], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), {
        provide: Auth, useValue: { usuario: signal({ rol: role }), getAccessToken: () => 'test-token' },
      }] }).compileComponents();
      const fixture = TestBed.createComponent(Dashboard);
      const requests = TestBed.inject(HttpTestingController).match(() => true);
      expect(requests.map(r => r.request.url.split('/api/v1/')[1])).toEqual(paths);
      requests.forEach(r => { expect(r.request.headers.get('Authorization')).toBe('Bearer test-token'); r.flush([]); });
      fixture.detectChanges();
      const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
      expect(links.length).toBe(paths.length);
      expect(links.every(link => link.getAttribute('href')?.startsWith('/dashboard/'))).toBe(true);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  }
});
