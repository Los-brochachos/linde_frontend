import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../core/auth/auth';
import { environment } from '../../../environments/environment';

const DETAIL: Record<string, string> = { CLIENTE: 'clientes', CONDUCTOR: 'conductores', TECNICO: 'tecnicos', PROGRAMADOR: 'programadores' };
const LABELS: Record<string, string> = {
  razonSocial: 'Razón social', ruc: 'RUC', nombres: 'Nombres', apellidos: 'Apellidos', dni: 'DNI',
  telefono: 'Teléfono', direccion: 'Dirección', fechaIngreso: 'Fecha de ingreso',
  licenciaConducir: 'Licencia de conducir', categoriaLicencia: 'Categoría de licencia',
  fechaVencimientoLicencia: 'Vencimiento de licencia', especialidad: 'Especialidad',
  nivelTecnico: 'Nivel técnico', nivelIngles: 'Nivel de inglés', turno: 'Turno',
};

@Component({ selector: 'app-perfil', imports: [CardModule, ButtonModule], templateUrl: './perfil.html' })
export class Perfil {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  readonly usuario = this.auth.usuario;
  readonly loading = signal(false);
  readonly error = signal('');
  readonly detailError = signal('');
  readonly fields = signal<{ label: string; value: string }[]>([]);

  constructor() { this.load(); }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true); this.error.set(''); this.detailError.set(''); this.fields.set([]);
    this.auth.cargarUsuario().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => {
        const resource = DETAIL[user.rol];
        if (!resource) { this.loading.set(false); return; }
        this.http.get<Record<string, unknown>>(`${environment.apiUrl}/api/v1/${resource}/me`, {
          headers: { Authorization: `Bearer ${this.auth.getAccessToken()}` },
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: detail => {
            this.fields.set(Object.entries(LABELS).filter(([key]) => detail[key] !== undefined && detail[key] !== null)
              .map(([key, label]) => ({ label, value: String(detail[key]) })));
            this.loading.set(false);
          },
          error: () => { this.detailError.set('No se pudieron obtener los datos adicionales de tu perfil.'); this.loading.set(false); },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 401 ? 'Tu sesión ha vencido. Vuelve a iniciar sesión.' : 'No se pudo consultar tu perfil. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }
}
