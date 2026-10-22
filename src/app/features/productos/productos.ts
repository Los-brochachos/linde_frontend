
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './productos.html'
})
export class Producto {

  readonly gases = [
    {
      nombre: 'Gases industriales',
      descripcion: 'Gases utilizados en procesos de fabricación, soldadura, metalurgia, procesamiento de alimentos y múltiples aplicaciones industriales.',
      icono: 'pi pi-cog',
      ejemplos: 'Oxígeno, nitrógeno, argón y dióxido de carbono'
    },
    {
      nombre: 'Gases especiales',
      descripcion: 'Gases de alta pureza y mezclas especializadas para laboratorios, investigación, análisis y procesos que requieren precisión.',
      icono: 'pi pi-sliders-h',
      ejemplos: 'Gases de calibración, mezclas y gases de alta pureza'
    },
    {
      nombre: 'Gases medicinales',
      descripcion: 'Soluciones de gases para aplicaciones sanitarias y procesos de atención médica que requieren calidad y seguridad.',
      icono: 'pi pi-heart',
      ejemplos: 'Oxígeno medicinal y mezclas de uso médico'
    },
    {
      nombre: 'Hidrógeno y gases energéticos',
      descripcion: 'Soluciones para aplicaciones energéticas, procesos químicos y tecnologías relacionadas con la transición energética.',
      icono: 'pi pi-bolt',
      ejemplos: 'Hidrógeno y soluciones para procesos energéticos'
    }
  ];

  readonly suministros = [
    {
      numero: '01',
      titulo: 'Cilindros',
      descripcion: 'Una alternativa flexible y práctica para operaciones con necesidades de suministro de menor volumen.',
      icono: 'pi pi-box'
    },
    {
      numero: '02',
      titulo: 'Abastecimiento líquido',
      descripcion: 'Suministro de gases en estado líquido para operaciones que requieren mayores volúmenes y continuidad.',
      icono: 'pi pi-database'
    },
    {
      numero: '03',
      titulo: 'Suministro por tubería',
      descripcion: 'Soluciones de distribución de gases mediante infraestructura diseñada para procesos industriales.',
      icono: 'pi pi-sitemap'
    },
    {
      numero: '04',
      titulo: 'Producción en sitio',
      descripcion: 'Sistemas de generación y abastecimiento de gases integrados a las necesidades de determinadas instalaciones.',
      icono: 'pi pi-building'
    }
  ];

  readonly beneficios = [
    {
      titulo: 'Mayor productividad',
      descripcion: 'Soluciones orientadas a mejorar el desempeño de los procesos industriales.',
      icono: 'pi pi-chart-line'
    },
    {
      titulo: 'Seguridad operativa',
      descripcion: 'Tecnologías y prácticas que ayudan a mantener condiciones de trabajo seguras.',
      icono: 'pi pi-shield'
    },
    {
      titulo: 'Suministro adecuado',
      descripcion: 'Distintas modalidades de abastecimiento según los requerimientos de cada operación.',
      icono: 'pi pi-truck'
    },
    {
      titulo: 'Soporte especializado',
      descripcion: 'Conocimiento técnico para seleccionar gases, equipos y aplicaciones.',
      icono: 'pi pi-users'
    }
  ];

}
