import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface PedidoResponse {
  idPedido: number;
  fechaRegistro: string;
  estado: string;
  fechaEntregaEstimada: string;
  horaEntregaEstimada: string;
  prioridad: string;
  idCliente: number;
  productoSolicitado: string; 
  cisternaAsignada: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
})
export class Citas implements OnInit {

  constructor(private router: Router) {}

  verSeguimiento(idPedido: number) {
    this.router.navigate(['/cliente/seguimiento'], {
      queryParams: { codigo: idPedido }
    });
  }

  mostrarModalCita: boolean = false;

  nuevaCita = {
    fechaEntregaEstimada: '',
    horaEntregaEstimada: '',
    prioridad: 'MEDIA',
    idProducto: 1,
    cantidad: 1
  };

  productosDisponibles = [
    { id: 1, nombre: 'Oxígeno Medicinal T-50' },
    { id: 2, nombre: 'Oxígeno Medicinal T-10' },
    { id: 3, nombre: 'Cilindro de Nitrógeno Líquido 20L' },
    { id: 4, nombre: 'Acetileno Industrial Grado A' }
  ];

  historialCitas: PedidoResponse[] = [
    {
      idPedido: 1024,
      fechaRegistro: '2026-10-15T08:30:00',
      estado: 'PENDIENTE',
      fechaEntregaEstimada: '22/10/2026',
      horaEntregaEstimada: '10:30 AM',
      prioridad: 'ALTA',
      idCliente: 45,
      productoSolicitado: 'Oxígeno Medicinal T-50 (2 unidades)',
      cisternaAsignada: 'Por asignar' // 👈 Aún no tiene camión asignado
    },
    {
      idPedido: 1019,
      fechaRegistro: '2026-10-10T14:15:00',
      estado: 'EN_CAMINO',
      fechaEntregaEstimada: '20/10/2026',
      horaEntregaEstimada: '02:45 PM',
      prioridad: 'MEDIA',
      idCliente: 45,
      productoSolicitado: 'Cilindro de Nitrógeno Líquido de 20L (1 unidad)',
      cisternaAsignada: 'CIS-983 (Linde Perú)' // 👈 Camión en ruta
    },
    {
      idPedido: 998,
      fechaRegistro: '2026-09-28T11:00:00',
      estado: 'ENTREGADO',
      fechaEntregaEstimada: '02/10/2026',
      horaEntregaEstimada: '11:15 AM',
      prioridad: 'BAJA',
      idCliente: 45,
      productoSolicitado: 'Oxígeno Medicinal T-10 (3 unidades)',
      cisternaAsignada: 'CIS-412 (Linde Perú)' // 👈 Ya entregado
    }
  ];

  ngOnInit(): void {}

  abrirModal() {
    this.mostrarModalCita = true;
  }

  cerrarModal() {
    this.mostrarModalCita = false;
  }

  guardarCita() {
    const prodSeleccionado = this.productosDisponibles.find(p => p.id === Number(this.nuevaCita.idProducto));
    
    const nuevoPedido: PedidoResponse = {
      idPedido: Math.floor(Math.random() * 900) + 1100,
      fechaRegistro: new Date().toISOString(),
      estado: 'PENDIENTE',
      fechaEntregaEstimada: this.nuevaCita.fechaEntregaEstimada,
      horaEntregaEstimada: this.nuevaCita.horaEntregaEstimada || '08:00 AM',
      prioridad: this.nuevaCita.prioridad,
      idCliente: 45,
      productoSolicitado: `${prodSeleccionado?.nombre} (${this.nuevaCita.cantidad} unidades)`,
      cisternaAsignada: 'Por asignar' // 👈 Por defecto entra sin unidad asignada
    };

    this.historialCitas.unshift(nuevoPedido);
    this.cerrarModal();
    this.nuevaCita = { fechaEntregaEstimada: '', horaEntregaEstimada: '', prioridad: 'MEDIA', idProducto: 1, cantidad: 1 };
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EN_CAMINO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENTREGADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
}
