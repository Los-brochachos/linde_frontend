import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { Auth } from '../../../core/auth/auth';
import { Listado } from './listado';

describe('Listados por módulo y filtros URL', () => {
  async function setup(rol = 'ADMIN', key = 'usuarios') {
    const data = new BehaviorSubject({sectionKey: key});
    const params = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({ imports: [Listado], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { data, queryParamMap: params } },
      { provide: Auth, useValue: { usuario: signal({rol}), getAccessToken: () => 'token' } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(Listado);
    return { fixture, http: TestBed.inject(HttpTestingController), data, params };
  }
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });
  it('solo consulta el módulo abierto y restaura búsqueda/página desde la URL', async () => {
    const {fixture, http, params} = await setup();
    const requests = http.match(() => true); expect(requests).toHaveLength(1);
    expect(requests[0].request.url).toContain('/usuarios');
    requests[0].flush(Array.from({length:12}, (_,id) => ({idUsuario:id, correo:`qa${id}@example.com`,rol:'ADMIN'})));
    params.next(convertToParamMap({pagina:'2'}));
    expect(fixture.componentInstance.visible()).toHaveLength(2);
    params.next(convertToParamMap({q:'qa11',pagina:'999'}));
    expect(fixture.componentInstance.filtered()).toHaveLength(1);
    expect(fixture.componentInstance.page()).toBe(1);
  });
  it('cliente usa mis-pedidos y no el listado general', async () => {
    const {http} = await setup('CLIENTE','pedidos');
    http.expectOne(r => r.url.endsWith('/pedidos/mis-pedidos')).flush([]);
  });
  it('una sección ajena no dispara consultas', async () => {
    const {fixture,http} = await setup('CONDUCTOR','usuarios');
    expect(http.match(() => true)).toHaveLength(0);
    expect(fixture.componentInstance.error()).toContain('No tienes acceso');
  });
  it('muestra error y permite reintentar sin recargar toda la aplicación', async () => {
    const {fixture,http} = await setup();
    http.expectOne(r=>r.url.endsWith('/usuarios')).flush({}, {status:403,statusText:'Forbidden'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No tienes permiso');
    fixture.componentInstance.refresh();
    http.expectOne(r=>r.url.endsWith('/usuarios')).flush([{correo:'nuevo@example.com'}]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('nuevo@example.com');
  });
  it('la búsqueda escribe q y reinicia la página, no usa seccion', async () => {
    const {fixture,http} = await setup();
    http.expectOne(r=>r.url.endsWith('/usuarios')).flush([]);
    const navigate = vi.spyOn(TestBed.inject(Router),'navigate').mockResolvedValue(true);
    fixture.componentInstance.filter('qa');
    expect(navigate).toHaveBeenCalledWith([],expect.objectContaining({queryParams:{q:'qa',pagina:null},replaceUrl:true}));
  });
});
