import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from './header';
import { Auth } from '../../../core/auth/auth';

describe('Header compartido', () => {
  afterEach(() => TestBed.resetTestingModule());
  async function setup(role: string) {
    const usuario = signal({ rol: role, correo: 'qa@example.com' });
    const result = new Subject<void>();
    await TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([]), {
      provide: Auth, useValue: { usuario, logout: () => result },
    }] }).compileComponents();
    const fixture = TestBed.createComponent(Header);
    return { fixture, usuario, result };
  }
  it('cliente abre el perfil de su portal', async () => {
    const { fixture } = await setup('CLIENTE');
    expect(fixture.componentInstance.items()[0].routerLink).toBe('/cliente/perfil');
  });
  it('el perfil cambia al cambiar el rol de la sesión', async () => {
    const { fixture, usuario } = await setup('ADMIN');
    expect(fixture.componentInstance.items()[0].routerLink).toBe('/dashboard/perfil');
    usuario.set({ rol: 'CLIENTE', correo: 'cliente@example.com' });
    expect(fixture.componentInstance.items()[0].routerLink).toBe('/cliente/perfil');
  });
  it('ambos portales esperan confirmación del logout antes de navegar', async () => {
    const { fixture, result } = await setup('CLIENTE');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.cerrarSesion();
    expect(navigate).not.toHaveBeenCalled();
    result.next();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
