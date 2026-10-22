
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nosotros.html'
})
export class Nosotros {

  readonly valores = [
    {
      icono: 'pi pi-shield',
      titulo: 'Seguridad',
      descripcion: 'La seguridad es un valor fundamental. Trabajamos para proteger a las personas, las comunidades y el medioambiente.'
    },
    {
      icono: 'pi pi-verified',
      titulo: 'Integridad',
      descripcion: 'Promovemos comportamientos éticos, respetuosos y transparentes en nuestras relaciones profesionales.'
    },
    {
      icono: 'pi pi-users',
      titulo: 'Inclusión',
      descripcion: 'Valoramos la diversidad de experiencias, capacidades e ideas que fortalecen nuestra organización.'
    },
    {
      icono: 'pi pi-globe',
      titulo: 'Comunidad',
      descripcion: 'Buscamos contribuir positivamente a las comunidades donde vivimos y desarrollamos nuestras actividades.'
    }
  ];

  readonly compromisos = [
    {
      numero: '01',
      icono: 'pi pi-bolt',
      titulo: 'Energía más limpia',
      descripcion: 'Impulsamos tecnologías relacionadas con el hidrógeno, la captura de carbono y la descarbonización de procesos industriales.'
    },
    {
      numero: '02',
      icono: 'pi pi-heart',
      titulo: 'Personas y comunidades',
      descripcion: 'Fomentamos la participación comunitaria, el voluntariado y las iniciativas que contribuyen al bienestar colectivo.'
    },
    {
      numero: '03',
      icono: 'pi pi-shield',
      titulo: 'Seguridad y medioambiente',
      descripcion: 'Priorizamos la prevención de incidentes, la protección ambiental y las condiciones de trabajo seguras.'
    }
  ];

}
