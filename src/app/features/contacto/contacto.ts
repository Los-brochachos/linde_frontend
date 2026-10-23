import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto',
  imports: [RouterLink],
  templateUrl: './contacto.html',
})
export class Contacto {
  readonly canales = [
    {
      titulo: 'Teléfono',
      valor: '+51 1 517 2370',
      descripcion: 'Atención telefónica para consultas y solicitudes.',
      icono: 'pi pi-phone',
      enlace: 'tel:+5115172370',
      accion: 'Llamar ahora'
    },
    {
      titulo: 'Línea gratuita',
      valor: '0800 22520',
      descripcion: 'Comuníquese con nuestro servicio de atención.',
      icono: 'pi pi-headphones',
      enlace: 'tel:080022520',
      accion: 'Llamar ahora'
    },
    {
      titulo: 'Correo electrónico',
      valor: 'pedidos@withoutperu.com',
      descripcion: 'Envíenos sus consultas y solicitudes comerciales.',
      icono: 'pi pi-envelope',
      enlace: 'mailto:pedidos@withoutperu.com',
      accion: 'Enviar correo'
    }
  ];
}