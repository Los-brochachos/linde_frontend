import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from './header';
import { Auth } from '../../../core/auth/auth';

describe('Cerrar sesión del portal del cliente',()=>{
  afterEach(()=>TestBed.resetTestingModule());
  async function setup(){
    const result=new Subject<void>();const logout=vi.fn(()=>result);
    await TestBed.configureTestingModule({imports:[Header],providers:[provideRouter([]),{provide:Auth,useValue:{usuario:signal({correo:'qa@example.com'}),logout}}]}).compileComponents();
    const fixture=TestBed.createComponent(Header);const navigate=vi.spyOn(TestBed.inject(Router),'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.abrirConfirmacion();fixture.componentInstance.aceptarCierre();
    return {fixture,result,logout,navigate};
  }
  it('espera la confirmación del servidor antes de salir',async()=>{
    const {fixture,result,logout,navigate}=await setup();
    expect(logout).toHaveBeenCalledOnce();expect(navigate).not.toHaveBeenCalled();
    result.next();expect(navigate).toHaveBeenCalledWith('/login');expect(fixture.componentInstance.mostrarModalConfirmacion).toBe(false);
  });
  it('conserva el diálogo y permite reintentar si falla logout',async()=>{
    const {fixture,result,navigate}=await setup();result.error(new Error('network'));
    expect(navigate).not.toHaveBeenCalled();expect(fixture.componentInstance.error).toContain('No se pudo cerrar');
    expect(fixture.componentInstance.mostrarModalConfirmacion).toBe(true);expect(fixture.componentInstance.cerrando).toBe(false);
  });
});
