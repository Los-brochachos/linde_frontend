import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Type, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, from, map, of, switchMap, tap } from 'rxjs';
import { Auth } from '../../../core/auth/auth';

/** El router conserva este contenedor, pero cada sesión selecciona su propia vista. */
@Component({
  selector: 'app-vista-rol', imports: [NgComponentOutlet],
  template: `@if (error()) { <p role="alert" class="p-6 text-red-700">{{ error() }}</p> }
    @else if (componente(); as vista) { <ng-container *ngComponentOutlet="vista" /> }
    @else { <p role="status" class="p-6">Cargando pantalla…</p> }`,
})
export class VistaRol {
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly componente = signal<Type<unknown> | null>(null);
  readonly error = signal('');
  constructor() {
    combineLatest([this.route.data, toObservable(this.auth.usuario)]).pipe(
      map(([data, usuario]) => ({ vista: data['vistaRol'] as string, rol: usuario?.rol || '' })),
      distinctUntilChanged((a, b) => a.vista === b.vista && a.rol === b.rol),
      tap(() => { this.componente.set(null); this.error.set(''); }),
      switchMap(({ vista, rol }) => !rol ? of(null) : from(this.cargar(vista, rol)).pipe(catchError(() => {
        this.error.set('No se pudo cargar la pantalla. Recarga la página para intentarlo nuevamente.'); return of(null);
      }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(componente => this.componente.set(componente));
  }
  private cargar(vista: string, rol: string): Promise<Type<unknown>> {
    if (vista === 'inicio') return rol === 'PROGRAMADOR'
      ? import('../../trabajador/programador/inicio/inicio').then(m => m.InicioProgramador)
      : import('../dashboard').then(m => m.Dashboard);
    if (vista === 'pedidos' && rol === 'PROGRAMADOR')
      return import('../../trabajador/programador/pedidos/pedidos').then(m => m.PedidosProgramador);
    if (vista === 'atenciones' && rol === 'CONDUCTOR')
      return import('../../trabajador/conductor/atenciones/listado/listado').then(m => m.MisAtencionesConductor);
    if (vista === 'atenciones' && rol === 'PROGRAMADOR')
      return import('../../trabajador/programador/atenciones/listado/listado').then(m => m.AtencionesProgramador);
    return import('../listado/listado').then(m => m.Listado);
  }
}
