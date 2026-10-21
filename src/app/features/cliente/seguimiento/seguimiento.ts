import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
 
export interface SeguimientoPedido {
  idPedido: number;
  estado: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  fechaRegistro: string;
  fechaEntregaEstimada: string;
  horaEntregaEstimada: string;
  productoSolicitado: string;
  cantidad: number;
  direccionEntrega: string;
  cisterna: { placa: string; capacidad: string } | null;
  conductor: { nombre: string; telefono: string; licencia: string } | null;
}
 
@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seguimiento.html',
})
export class Seguimiento implements OnInit {
 
  codigoBusqueda = '';
  pedido: SeguimientoPedido | null = null;
  buscado = false;
  error = '';
 
  pasos = [
    { titulo: 'Solicitud registrada', icono: 'bi-clipboard-check' },
    { titulo: 'Cisterna asignada', icono: 'bi-truck' },
    { titulo: 'En camino', icono: 'bi-geo-alt' },
    { titulo: 'Entregado', icono: 'bi-check2-circle' },
  ];
 
  // Datos de ejemplo: luego se reemplaza por una llamada al backend
  private pedidos: SeguimientoPedido[] = [
    {
      idPedido: 1024, estado: 'PENDIENTE', prioridad: 'ALTA',
      fechaRegistro: '2026-10-15T08:30:00',
      fechaEntregaEstimada: '22/10/2026', horaEntregaEstimada: '10:30 AM',
      productoSolicitado: 'Oxígeno Medicinal T-50', cantidad: 1500,
      direccionEntrega: 'Av. Argentina 1234, Callao',
      cisterna: null, conductor: null,
    },
    {
      idPedido: 1019, estado: 'EN_CAMINO', prioridad: 'MEDIA',
      fechaRegistro: '2026-10-10T14:15:00',
      fechaEntregaEstimada: '20/10/2026', horaEntregaEstimada: '02:45 PM',
      productoSolicitado: 'Cilindro de Nitrógeno Líquido 20L', cantidad: 5000,
      direccionEntrega: 'Av. Argentina 1234, Callao',
      cisterna: { placa: 'CIS-983', capacidad: '12 000 L' },
      conductor: { nombre: 'Carlos Ramírez Soto', telefono: '987 111 222', licencia: 'Q45678912' },
    },
    {
      idPedido: 998, estado: 'ENTREGADO', prioridad: 'BAJA',
      fechaRegistro: '2026-09-28T11:00:00',
      fechaEntregaEstimada: '02/10/2026', horaEntregaEstimada: '11:15 AM',
      productoSolicitado: 'Oxígeno Medicinal T-10', cantidad: 3500,
      direccionEntrega: 'Av. Argentina 1234, Callao',
      cisterna: { placa: 'CIS-412', capacidad: '8 000 L' },
      conductor: { nombre: 'Luis Mendoza Quispe', telefono: '987 333 444', licencia: 'Q12345678' },
    },
  ];
 
  constructor(private route: ActivatedRoute) {}
 
  ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
    const codigo = params.get('codigo');
    if (codigo) {
      this.codigoBusqueda = codigo;
      this.buscar();
    }
  });
}
 
  buscar(): void {
    this.buscado = true;
    this.error = '';
    this.pedido = null;
 
    const limpio = this.codigoBusqueda.replace(/[^0-9]/g, '');
    if (!limpio) {
      this.error = 'Ingresa un código de cita válido.';
      return;
    }
 
    const encontrado = this.pedidos.find(p => p.idPedido === Number(limpio));
    if (!encontrado) {
      this.error = `No encontramos ninguna cita con el código #${limpio}.`;
      return;
    }
    this.pedido = encontrado;
  }
 
  limpiar(): void {
    this.codigoBusqueda = '';
    this.pedido = null;
    this.buscado = false;
    this.error = '';
  }
 
  // Índice del último paso completado en la línea de tiempo
  pasoActual(p: SeguimientoPedido): number {
    switch (p.estado) {
      case 'ENTREGADO': return 3;
      case 'EN_CAMINO': return 2;
      default: return p.cisterna ? 1 : 0;
    }
  }
 
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EN_CAMINO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENTREGADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
 
  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'ALTA': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIA': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
}
 