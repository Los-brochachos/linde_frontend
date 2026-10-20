import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AtencionResponse } from '../../../core/models/AtencionModel';
import { AtencionService } from '../../../core/services/atencion/atencion-service';

@Component({ imports: [CommonModule, RouterLink], selector: 'app-citas', templateUrl: './citas.html' })
export class Citas {
  private readonly service = inject(AtencionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly citas = signal<AtencionResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  constructor() { this.load(); }
  load() {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.service.misAtenciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.citas.set(rows); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron consultar tus citas.'); this.loading.set(false); },
    });
  }
}
