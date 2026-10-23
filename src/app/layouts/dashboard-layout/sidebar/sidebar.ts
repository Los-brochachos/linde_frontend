
import {
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';

import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { Auth } from '../../../core/auth/auth';
import { ClienteService } from '../../../core/services/cliente/cliente-service';
import { ApiService } from '../../../core/services/api.service';
import { DASHBOARD_ROLES } from '../../../features/dashboard/dashboard-data';

const CLIENT_SECTIONS = [
  { key: 'pedidos', title: 'Pedidos', route: '/cliente/pedidos' },
  { key: 'citas', title: 'Citas', route: '/cliente/citas' },
  { key: 'seguimiento', title: 'Seguimiento', route: '/cliente/seguimiento' },
  { key: 'productos', title: 'Productos', route: '/cliente/productos' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, InputTextModule],
  templateUrl: './sidebar.html',
  encapsulation: ViewEncapsulation.None,
  styles: `



      /* ENLACES Y BOTONES */
      .without-sidebar-link {
        position: relative;
        border: 0;
        border-radius: 6px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      /* ENLACE NORMAL SELECCIONADO */
      .without-sidebar-link.without-sidebar-active {
        background: #07365f !important;
        color: #ffffff !important;
        font-weight: 600;
      }

      /* GRUPO PEDIDOS ACTIVO: SOLO LÍNEA IZQUIERDA */
      .without-sidebar-group.without-sidebar-active {
        background: transparent !important;
        box-shadow: none !important;
        color: #ffffff !important;
      }

      /* INDICADOR LATERAL */
      .without-sidebar-link.without-sidebar-active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 18%;
        width: 3px;
        height: 64%;
        background: #38bdf8;
        border-radius: 0 3px 3px 0;
      }

      /* ICONOS */
      .without-sidebar-link.without-sidebar-active > i:first-child {
        color: #ffffff !important;
      }

      /* HOVER */
      .without-sidebar-link:not(.without-sidebar-active):hover {
        background: #094272 !important;
      }

      /* SUBOPCIÓN ACTIVA */
      .without-sidebar-subitem.without-sidebar-active {
        background: #07365f !important;
        color: #ffffff !important;
      }

      /* SCROLLBAR */
      app-sidebar ::-webkit-scrollbar {
        width: 5px;
      }

      app-sidebar ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.35);
        border-radius: 8px;
      }

      app-sidebar ::-webkit-scrollbar-track {
        background: transparent;
      }

  `
})
export class Sidebar {

  private readonly router = inject(Router);
  readonly pedidosAbiertos = signal(false);
  readonly atencionesAbiertas = signal(false);
  readonly trabajadoresAbiertos = signal(false);
  readonly trabajadoresActivos = computed(() => /^\/dashboard\/trabajadores(?:\/|$)/.test(this.rutaActual()));
  readonly atencionesActivas = computed(() => /^\/dashboard\/atenciones(?:\/|$)/.test(this.rutaActual()));
  abierto(key: string) { return !!this.search().trim() || (key === 'pedidos' ? this.pedidosAbiertos() : key === 'trabajadores' ? this.trabajadoresAbiertos() : this.atencionesAbiertas()); }
  activo(key: string) { return key === 'pedidos' ? this.pedidosActivos() : key === 'trabajadores' ? this.trabajadoresActivos() : this.atencionesActivas(); }
  toggleGrupo(key: string) { if (key === 'pedidos') this.togglePedidos(); else if (key === 'trabajadores') this.trabajadoresAbiertos.update(v => !v); else this.atencionesAbiertas.update(v => !v); }
  readonly rutaActual = signal(this.router.url.split(/[?#]/)[0]);
  readonly pedidosActivos = computed(() => /^\/(cliente|dashboard)\/pedidos(?:\/|$)/.test(this.rutaActual()));
  readonly mostrarPedidos = computed(() => this.pedidosAbiertos() || !!this.search().trim());

  togglePedidos() { this.pedidosAbiertos.update(abierto => !abierto); }

  constructor() {
    if (this.trabajadoresActivos()) this.trabajadoresAbiertos.set(true);
    if (this.atencionesActivas()) this.atencionesAbiertas.set(true);
    if (this.pedidosActivos()) this.pedidosAbiertos.set(true);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(event => {
        this.rutaActual.set(event.urlAfterRedirects.split(/[?#]/)[0]);
        if (this.trabajadoresActivos()) this.trabajadoresAbiertos.set(true);
        if (this.atencionesActivas()) this.atencionesAbiertas.set(true);
        if (this.pedidosActivos()) this.pedidosAbiertos.set(true);
      });
  }

  readonly usuario = inject(Auth).usuario;

  readonly iconosAdmin: Record<string, string> = {
    usuarios: 'pi pi-id-card', clientes: 'pi pi-building', alertas: 'pi pi-bell',
    fallas: 'pi pi-exclamation-triangle', productos: 'pi pi-box', cisternas: 'pi pi-truck',
    conductores: 'pi pi-compass', historial: 'pi pi-history',
  };
  readonly search = signal('');

  readonly isClient = computed(() =>
    this.usuario()?.rol === 'CLIENTE'
  );

  readonly home = computed(() =>
    this.isClient() ? '/cliente/inicio' : '/dashboard'
  );

  readonly profile = computed(() =>
    this.isClient() ? '/cliente/perfil' : '/dashboard/perfil'
  );


  readonly logoError = signal(false);

  private readonly api = inject(ApiService);
  private readonly clientes = inject(ClienteService);
  private readonly nombrePerfil = toSignal(combineLatest([toObservable(this.usuario), toObservable(this.clientes.revision)]).pipe(
    switchMap(([usuario]) => {
      if (!usuario) return of('');
      const cliente = usuario.rol === 'CLIENTE';
      return this.api.get<{ razonSocial?: string; nombres?: string; apellidos?: string }>(cliente ? 'clientes/me' : 'trabajadores/me').pipe(
        map(perfil => cliente ? (perfil.razonSocial?.trim() ?? '') : [perfil.nombres, perfil.apellidos].map(valor => valor?.trim()).filter(Boolean).join(' ')),
        catchError(() => of('')),
        startWith(''),
      );
    }),
  ), { initialValue: '' });
  readonly empresaNombre = computed(() => this.nombrePerfil() || this.usuario()?.correo || 'Mi cuenta');

  readonly empresaLogoUrl = signal<string | null>(null);

  readonly empresaLogo = computed(() =>
    this.logoError() ? null : this.empresaLogoUrl()
  );


  readonly sections = computed(() => {

    const query = this.search().trim().toLocaleLowerCase();

    const menu = this.isClient()
      ? CLIENT_SECTIONS
      : (DASHBOARD_ROLES[this.usuario()?.rol ?? '']?.sections ?? []).map(section => ({
          key: section.key,
          title: section.title,
          route: `/dashboard/${section.key}`,
        }));

    return menu.map(section => {
      const children = section.key === 'trabajadores' && this.usuario()?.rol === 'ADMIN' ? [
        { title: 'Crear Trabajador', route: '/dashboard/trabajadores/nuevo', icon: 'pi pi-user-plus' },
        { title: 'Listar Trabajadores', route: '/dashboard/trabajadores', icon: 'pi pi-list' },
      ] : section.key === 'atenciones' ? [
        { title: this.usuario()?.rol === 'CONDUCTOR' ? 'Mis atenciones' : 'Listar atenciones', route: '/dashboard/atenciones', icon: 'pi pi-list' },
        ...(this.usuario()?.rol === 'PROGRAMADOR' ? [{ title: 'Crear atención', route: '/dashboard/atenciones/nueva', icon: 'pi pi-calendar-plus' }] : []),
      ] : section.key !== 'pedidos' ? [] : this.isClient()
        ? [{ title: 'Mis pedidos', route: '/cliente/pedidos', icon: 'pi pi-list' },
           { title: 'Crear pedido', route: '/cliente/pedidos/nuevo', icon: 'pi pi-plus' }]
        : [{ title: 'Listar pedidos', route: '/dashboard/pedidos', icon: 'pi pi-list' }];
      const matches = section.title.toLocaleLowerCase().includes(query);
      return { ...section, children: children.filter(child => matches || child.title.toLocaleLowerCase().includes(query)), matches };
    }).filter(section => section.matches || section.children.length > 0);
  });
}
