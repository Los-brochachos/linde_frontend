import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { Auth } from '../../../core/auth/auth';
import { ApiService } from '../../../core/services/api.service';
import { DASHBOARD_ROLES, DashboardSection } from '../dashboard-data';

type Row = Record<string, unknown>;
@Component({ selector: 'app-listado', imports: [InputTextModule, RouterLink], templateUrl: './listado.html' })
export class Listado {
  private readonly auth = inject(Auth);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly section = signal<DashboardSection | null>(null);
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly requestedPage = signal(1);
  readonly back = this.auth.usuario()?.rol === 'CLIENTE' ? '/cliente/inicio' : '/dashboard';
  readonly isClientOrders = computed(() => this.auth.usuario()?.rol === 'CLIENTE' && this.section()?.key === 'pedidos');
  readonly canSchedule = computed(() => this.auth.usuario()?.rol === 'PROGRAMADOR' && ['pedidos', 'atenciones'].includes(this.section()?.key ?? ''));
  readonly isDriverAttendances = computed(() => this.auth.usuario()?.rol === 'CONDUCTOR' && this.section()?.key === 'atenciones');
  readonly canEditAttendances = computed(() => this.auth.usuario()?.rol === 'PROGRAMADOR' && this.section()?.key === 'atenciones');
  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    return this.rows().filter(row => !q || this.section()?.columns.some(column => this.value(row, column.key).toLocaleLowerCase().includes(q)));
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 10)));
  readonly page = computed(() => Math.min(this.requestedPage(), this.pages()));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 10, this.page() * 10));

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.query.set(params.get('q') ?? '');
      const page = Number(params.get('pagina'));
      this.requestedPage.set(Number.isSafeInteger(page) && page > 0 ? page : 1);
    });
    combineLatest([this.route.data, this.reload.pipe(startWith(undefined))]).pipe(tap(([data]) => {
      this.section.set(DASHBOARD_ROLES[this.auth.usuario()?.rol ?? '']?.sections.find(section => section.key === data['sectionKey']) ?? null);
      this.rows.set([]); this.error.set(''); this.loading.set(true);
    }), switchMap(() => {
      const section = this.section();
      if (!section) { this.error.set('No tienes acceso a este módulo.'); return of([] as Row[]); }
      return this.api.get<Row[]>(section.path).pipe(catchError(error => {
        this.error.set(error.status === 403 ? 'No tienes permiso para consultar esta información.'
          : error.status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.'
          : 'No se pudo cargar la información. Intenta actualizar.');
        return of([] as Row[]);
      }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(rows => { this.rows.set(rows); this.loading.set(false); });
  }
  filter(query: string) {
    this.query.set(query);
    this.navigate(query, 1);
  }
  changePage(page: number) { this.navigate(this.query(), page); }
  private navigate(q: string, page: number) {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { q: q || null, pagina: page > 1 ? page : null }, replaceUrl: true });
  }
  refresh() { if (!this.loading()) this.reload.next(); }
  value(row: Row, key: string): string {
    const value = row[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }
}
