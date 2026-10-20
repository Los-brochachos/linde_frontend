import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Auth } from './auth';
import { authGuard } from './auth-guard';
import { homeForRole } from './access';

describe('Protección del portal y módulos', () => {
  afterEach(()=>TestBed.resetTestingModule());
  async function check(role: string, area: string, sectionKey?: string) {
    const user={rol:role,correo:'qa@example.com'};
    const auth={usuario:signal(user),getAccessToken:()=> 'token',clearSession:vi.fn(),refreshSession:vi.fn(()=>of(user))};
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:Auth,useValue:auth}]});
    const route={data:{sectionKey},pathFromRoot:[{data:{area}}]} as unknown as ActivatedRouteSnapshot;
    const result=await firstValueFrom(TestBed.runInInjectionContext(()=>authGuard(route,{} as RouterStateSnapshot)) as Observable<boolean|UrlTree>);
    return result===true ? true : TestBed.inject(Router).serializeUrl(result as UrlTree);
  }
  it('cliente va a su portal al intentar abrir gestión',async()=>expect(await check('CLIENTE','staff','usuarios')).toBe('/cliente/inicio'));
  it('administrador no entra al portal de clientes',async()=>expect(await check('ADMIN','cliente')).toBe('/dashboard'));
  it('conductor no puede abrir usuarios por URL',async()=>expect(await check('CONDUCTOR','staff','usuarios')).toBe('/dashboard'));
  it('técnico puede abrir fallas',async()=>expect(await check('TECNICO','staff','fallas')).toBe(true));
  it('cliente puede abrir sus pedidos',async()=>expect(await check('CLIENTE','cliente','pedidos')).toBe(true));
  it('login elige el destino correcto para cada rol',()=>{expect(homeForRole('CLIENTE')).toBe('/cliente/inicio');expect(homeForRole('ADMIN')).toBe('/dashboard');});
  it('recupera una sesión tras F5 y aplica el rol recuperado', async()=>{
    const auth={usuario:signal(null),getAccessToken:()=>null,clearSession:vi.fn(),refreshSession:vi.fn(()=>of({rol:'CLIENTE'}))};
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:Auth,useValue:auth}]});
    const route={data:{},pathFromRoot:[{data:{area:'staff'}}]} as unknown as ActivatedRouteSnapshot;
    const result=await firstValueFrom(TestBed.runInInjectionContext(()=>authGuard(route,{} as RouterStateSnapshot)) as Observable<UrlTree>);
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/cliente/inicio');expect(auth.refreshSession).toHaveBeenCalledOnce();
  });
  it('sesión vencida limpia memoria y redirige a login', async()=>{
    const auth={usuario:signal(null),getAccessToken:()=>null,clearSession:vi.fn(),refreshSession:()=>throwError(()=>new Error('401'))};
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:Auth,useValue:auth}]});
    const route={data:{},pathFromRoot:[]} as unknown as ActivatedRouteSnapshot;
    const result=await firstValueFrom(TestBed.runInInjectionContext(()=>authGuard(route,{} as RouterStateSnapshot)) as Observable<UrlTree>);
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');expect(auth.clearSession).toHaveBeenCalledOnce();
  });
});
