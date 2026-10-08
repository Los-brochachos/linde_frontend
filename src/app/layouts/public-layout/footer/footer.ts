import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-footer',
  templateUrl: './footer.html',
  styles: `
          /* Continentes */
          .continent .land {
            fill: #ffffff;
            transition: fill 0.3s ease;
          }

          /* Efecto al pasar el mouse */
          .continent:hover .land {
            fill: #00a6d6;
          }

          /* Puntos de ubicación */
          .continent .circle {
            fill: #00a6d6;
          }

          /* Anillos de los puntos */
          .continent .ring {
            fill: none;
            stroke: #00a6d6;
            stroke-width: 2;
          }


          .continent:hover .circle {
            fill: #ffffff;
          }

          /* Anillos de los puntos */
          .continent:hover .ring {
            fill: none;
            stroke: #ffffff;
            stroke-width: 2;
          }

          
          
  `

})
export class Footer {
  continenteSeleccionado = signal<string | null>(null);

  seleccionarContinente(continente: string): void {
    this.continenteSeleccionado.set(continente);
  }

  cerrarSeleccion(): void {
    this.continenteSeleccionado.set(null);
  }
}