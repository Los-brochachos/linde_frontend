import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE: Añade CommonModule para usar el *ngIf

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    ButtonModule,
    CommonModule // 👈 Agregado aquí
  ],
  templateUrl: './header.html',
})
export class Header {
  // Variable lógica para mostrar u ocultar el aviso flotante
  mostrarModalConfirmacion: boolean = false;

  constructor(private router: Router) {}

  // Abre el anuncio
  abrirConfirmacion() {
    this.mostrarModalConfirmacion = true;
  }

  // Cierra el anuncio si eligen Cancelar
  cancelarCierre() {
    this.mostrarModalConfirmacion = false;
  }

  // Ejecuta la redirección si eligen Aceptar
  aceptarCierre() {
    this.mostrarModalConfirmacion = false;
    this.router.navigate(['/login']);
  }
}
