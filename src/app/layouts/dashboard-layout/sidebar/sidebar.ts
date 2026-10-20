import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { Auth } from '../../../core/auth/auth';
import { DASHBOARD_ROLES } from '../../../features/dashboard/dashboard-data';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, InputTextModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly usuario = inject(Auth).usuario;
  readonly search = signal('');
  readonly sections = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return (DASHBOARD_ROLES[this.usuario()?.rol ?? '']?.sections ?? []).filter(section => section.title.toLocaleLowerCase().includes(query));
  });
}
