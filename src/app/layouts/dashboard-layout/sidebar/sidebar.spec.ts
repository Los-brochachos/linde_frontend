import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, afterEach } from 'vitest';
import { Auth } from '../../../core/auth/auth';
import { Sidebar } from './sidebar';

describe('Barra lateral por rol', () => {
  afterEach(() => TestBed.resetTestingModule());
  async function setup(rol: string) {
    await TestBed.configureTestingModule({ imports: [Sidebar], providers: [provideRouter([]), { provide: Auth, useValue: { usuario: signal({ rol }) } }] }).compileComponents();
    const fixture = TestBed.createComponent(Sidebar); fixture.detectChanges(); return fixture;
  }
  it('conductor tiene sus módulos y perfil con rutas independientes', async () => {
    const fixture = await setup('CONDUCTOR');
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map(link => link.textContent?.trim())).toEqual(['Resumen', 'Atenciones', 'Alertas', 'Mi perfil']);
    expect(links[1].getAttribute('href')).toBe('/dashboard/atenciones');
    expect(links[3].getAttribute('href')).toBe('/dashboard/perfil');
  });
  it('admin puede buscar las secciones adicionales', async () => {
    const fixture = await setup('ADMIN');
    expect(fixture.componentInstance.sections()).toHaveLength(10);
    fixture.componentInstance.search.set('usuarios'); fixture.detectChanges();
    expect(fixture.componentInstance.sections().map(section => section.key)).toEqual(['usuarios']);
    expect(fixture.nativeElement.textContent).not.toContain('Cisternas activas');
  });
  it('cliente reutiliza el sidebar con sus seis opciones y sin módulos administrativos', async () => {
    const fixture = await setup('CLIENTE');
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map(link => link.textContent?.trim())).toEqual(['Inicio', 'Mis pedidos', 'Citas', 'Seguimiento', 'Productos', 'Mi perfil']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/cliente/inicio', '/cliente/pedidos', '/cliente/citas', '/cliente/seguimiento', '/cliente/productos', '/cliente/perfil']);
    expect(links.some(link => link.getAttribute('href')?.startsWith('/dashboard'))).toBe(false);
  });
  it('cliente puede buscar Citas en el mismo menú', async () => {
    const fixture = await setup('CLIENTE');
    fixture.componentInstance.search.set('citas');
    fixture.detectChanges();
    expect(fixture.componentInstance.sections().map(section => section.key)).toEqual(['citas']);
  });
});
