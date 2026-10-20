import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../core/auth/auth';
import { environment } from '../../../environments/environment';
import { DASHBOARD_ROLES, DashboardSection } from './dashboard-data';
import { ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

type Row = Record<string, unknown>;
interface SectionState extends DashboardSection {
  rows: Row[];
  loading: boolean;
  error: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [InputTextModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly usuario = this.auth.usuario;
  readonly config = computed(() => DASHBOARD_ROLES[this.usuario()?.rol ?? '']);
  readonly sections = signal<SectionState[]>([]);
  readonly active = signal('');
  readonly search = signal('');
  readonly page = signal(0);
  readonly filtered = computed(() => {
    const section = this.selected();
    const query = this.search().trim().toLocaleLowerCase();
    return (section?.rows ?? []).filter(row => !query || section!.columns.some(column => this.value(row, column.key).toLocaleLowerCase().includes(query)));
  });
  readonly visible = computed(() => this.filtered().slice(this.page() * 10, this.page() * 10 + 10));
  readonly selected = computed(() => this.sections().find(section => section.key === this.active()));
  readonly loading = computed(() => this.sections().some(section => section.loading));

  constructor() {
    this.reload();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const key = params.get('seccion');
      if (key && this.config()?.sections.some(section => section.key === key)) this.select(key);
      else this.select(this.config()?.sections[0]?.key ?? '');
    });
  }

  select(key: string): void { this.active.set(key); this.search.set(''); this.page.set(0); }
  filter(value: string): void { this.search.set(value); this.page.set(0); }

  reload(): void {
    if (this.loading()) return;
    this.page.set(0);
    const definitions = this.config()?.sections ?? [];
    this.sections.set(definitions.map(section => ({ ...section, rows: [], loading: true, error: '' })));
    if (!definitions.some(section => section.key === this.active())) this.active.set(definitions[0]?.key ?? '');
    for (const section of definitions) {
      this.http.get<Row[]>(`${environment.apiUrl}/api/v1/${section.path}`, {
        headers: { Authorization: `Bearer ${this.auth.getAccessToken()}` },
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: rows => this.update(section.key, { rows, loading: false, error: '' }),
        error: (error: HttpErrorResponse) => this.update(section.key, {
          rows: [], loading: false,
          error: error.status === 403 ? 'No tienes permiso para consultar esta información.'
            : error.status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.'
            : 'No se pudo cargar la información. Intenta actualizar.',
        }),
      });
    }
  }

  value(row: Row, key: string): string {
    const value = row[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  private update(key: string, state: Pick<SectionState, 'rows' | 'loading' | 'error'>): void {
    this.sections.update(sections => sections.map(section => section.key === key ? { ...section, ...state } : section));
  }
}
