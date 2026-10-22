
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class Inicio {

  readonly industrias = [
    {
      titulo: 'Manufactura e industria',
      descripcion: 'Soluciones de gases para procesos de fabricación, tratamiento de materiales y producción industrial.',
      icono: 'pi pi-cog'
    },
    {
      titulo: 'Salud y medicina',
      descripcion: 'Gases medicinales y tecnologías que contribuyen a la atención de pacientes y centros de salud.',
      icono: 'pi pi-heart'
    },
    {
      titulo: 'Alimentos y bebidas',
      descripcion: 'Aplicaciones para el procesamiento, conservación y producción de alimentos y bebidas.',
      icono: 'pi pi-box'
    },
    {
      titulo: 'Minería y metalurgia',
      descripcion: 'Tecnologías y soluciones para operaciones mineras y procesos metalúrgicos.',
      icono: 'pi pi-building'
    }
  ];

  readonly beneficios = [
    {
      titulo: 'Experiencia industrial',
      descripcion: 'Conocimiento técnico y soluciones adaptadas a las necesidades de distintas industrias.',
      icono: 'pi pi-wrench'
    },
    {
      titulo: 'Tecnología e innovación',
      descripcion: 'Procesos y tecnologías orientados a mejorar la eficiencia y productividad.',
      icono: 'pi pi-bolt'
    },
    {
      titulo: 'Soluciones integrales',
      descripcion: 'Productos, equipos y modalidades de suministro para diferentes operaciones.',
      icono: 'pi pi-sitemap'
    }
  ];

}
