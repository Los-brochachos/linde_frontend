import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../../../../core/auth/auth';
import { TrabajadorService } from '../../../../../core/services/trabajador/trabajador-service';
import { RolTrabajador, TrabajadorResponse } from '../../../../../core/models/TrabajadorModel';
@Component({ selector: 'app-listado-trabajadores', imports: [CommonModule, RouterLink, InputTextModule, ButtonModule], templateUrl: './listado.html' })
export class ListadoTrabajadores {
  private readonly service = inject(TrabajadorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly usuario = inject(Auth).usuario;
  readonly trabajadores = signal<TrabajadorResponse[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly consulta = signal('');
  readonly estado = signal('ACTIVO');
  readonly filtroRol = signal('TODOS');
  readonly pagina = signal(1);
  readonly confirmar = signal<{ trabajador: TrabajadorResponse; activar: boolean } | null>(null);
  readonly roles: RolTrabajador[] = ['ADMIN', 'ANALISTA', 'PROGRAMADOR', 'CONDUCTOR', 'TECNICO'];
  readonly filtrados = computed(() => this.trabajadores().filter(t =>
    (this.estado() === 'TODOS' || t.estado === this.estado()) && (this.filtroRol() === 'TODOS' || t.rol === this.filtroRol())
    && [t.nombres, t.apellidos, `${t.nombres} ${t.apellidos}`, t.dni, t.correo].some(v => v.toLocaleLowerCase().includes(this.consulta().trim().toLocaleLowerCase())))
    .sort((a, b) => b.idTrabajador - a.idTrabajador));
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / 10)));
  readonly actual = computed(() => Math.min(this.pagina(), this.paginas()));
  readonly visibles = computed(() => this.filtrados().slice((this.actual() - 1) * 10, this.actual() * 10));

  constructor() {
    const p = this.route.snapshot.queryParamMap;
    this.consulta.set(p.get('q') || '');
    this.estado.set(['ACTIVO', 'INACTIVO', 'TODOS'].includes(p.get('estado') || '') ? p.get('estado')! : 'ACTIVO');
    this.filtroRol.set(this.roles.includes(p.get('rol') as RolTrabajador) ? p.get('rol')! : 'TODOS');
    const pagina = Number(p.get('pagina')); this.pagina.set(Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1);
    if ((inject(Location).getState() as { trabajadorGuardado?: boolean }).trabajadorGuardado) this.mensaje.set('Trabajador guardado correctamente.');
    this.cargar();
  }
  filtros() { return { q: this.consulta() || null, estado: this.estado(), rol: this.filtroRol(), pagina: this.actual() }; }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set('');
    this.service.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.trabajadores.set(rows); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo consultar el personal. Intenta nuevamente.'); this.cargando.set(false); },
    });
  }

  solicitarEstado(trabajador: TrabajadorResponse) { if (!this.guardando()) { this.confirmar.set({ trabajador, activar: trabajador.estado === 'INACTIVO' }); this.error.set(''); this.mensaje.set(''); } }
  cambiarEstado() {
    const c = this.confirmar(); if (!c || this.guardando()) return;
    this.guardando.set(true);
    (c.activar ? this.service.activar(c.trabajador.idTrabajador) : this.service.desactivar(c.trabajador.idTrabajador))
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: row => { this.trabajadores.update(rows => rows.map(t => t.idTrabajador === row.idTrabajador ? row : t)); this.confirmar.set(null); this.guardando.set(false); this.mensaje.set(c.activar ? 'Trabajador reactivado correctamente.' : 'Trabajador y cuenta desactivados. Se conserva su historial.'); },
        error: e => { this.guardando.set(false); this.error.set(this.errorTexto(e)); },
      });
  }

  private errorTexto(e: { status: number; error?: { message?: string } }) {
    return e.status === 400 || e.status === 409 ? e.error?.message || 'Revisa los datos; podrían estar registrados.'
      : e.status === 403 ? 'Solo ADMIN puede gestionar trabajadores.' : e.status === 401 ? 'Tu sesión ha vencido.' : 'No se pudo confirmar la operación. Actualiza el listado antes de volver a intentarlo.';
  }
}
