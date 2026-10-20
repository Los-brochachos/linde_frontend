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
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    return fixture;
  }
  it('cliente tiene pedidos propios y perfil, sin acceso al menú de usuarios', async () => {
    const fixture = await setup('CLIENTE');
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map(link => link.textContent?.trim())).toEqual(['Resumen', 'Mis pedidos', 'Productos disponibles', 'Mi perfil']);
    expect(links[1].getAttribute('href')).toBe('/dashboard?seccion=pedidos');
    expect(links[3].getAttribute('href')).toBe('/dashboard/perfil');
  });
  it('admin puede buscar las secciones adicionales del menú', async () => {
    const fixture = await setup('ADMIN');
    expect(fixture.componentInstance.sections().length).toBe(10);
    fixture.componentInstance.search.set('usuarios');
    fixture.detectChanges();
    expect(fixture.componentInstance.sections().map(section => section.key)).toEqual(['usuarios']);
    expect(fixture.nativeElement.textContent).not.toContain('Cisternas activas');
  });
});
