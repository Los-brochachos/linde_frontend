import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { ApiService } from '../../core/services/api.service';
import { DASHBOARD_ROLES, DashboardSection } from './dashboard-data';

interface Summary extends DashboardSection { count: number; loading: boolean; error: string; }
@Component({ selector: 'app-dashboard', imports: [RouterLink], templateUrl: './dashboard.html' })
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = this.auth.usuario;
  readonly config = computed(() => DASHBOARD_ROLES[this.usuario()?.rol ?? '']);
  readonly sections = signal<Summary[]>([]);
  readonly loading = computed(() => this.sections().some(section => section.loading));
  constructor() { this.reload(); }
  reload(): void {
    if (this.loading()) return;
    const definitions = this.config()?.sections ?? [];
    this.sections.set(definitions.map(section => ({ ...section, count: 0, loading: true, error: '' })));
    for (const section of definitions) {
      this.api.get<unknown[]>(section.path).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: rows => this.update(section.key, rows.length, ''),
        error: (error: HttpErrorResponse) => this.update(section.key, 0, error.status === 401
          ? 'Tu sesión ha vencido.' : 'No se pudo consultar este módulo.'),
      });
    }
  }
  private update(key: string, count: number, error: string) {
    this.sections.update(sections => sections.map(section => section.key === key ? { ...section, count, error, loading: false } : section));
  }
}