import { Component } from '@angular/core';
import { Pedido } from '../../../models/pedido';

@Component({
  selector: 'app-pedidos-alertas',
  standalone: false,
  templateUrl: './pedidos-alertas.html',
  styleUrl: './pedidos-alertas.scss',
})
export class PedidosAlertas {
  pedidos: Pedido[] = [
    {
      id: 'p-1001',
      fechaHora: '18/03/2024 · 08:30',
      servicio: 'UTI',
      componente: 'Sangre',
      grupoSanguineo: 'O-',
      cantidad: 2,
      prioridad: 'NORMAL',
      estado: 'PENDIENTE',
      solicitadoPor: 'Dra. Lopez',
      comentarios: 'Paciente crítico en UTI, se requiere disponibilidad inmediata.',
    },
    {
      id: 'p-1002',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plaquetas',
      grupoSanguineo: '—',
      cantidad: 4,
      prioridad: 'URGENTE',
      estado: 'PENDIENTE',
      solicitadoPor: 'Dr. Fernández',
    },
    {
      id: 'p-1003',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plasma',
      grupoSanguineo: 'AB+',
      cantidad: 1,
      prioridad: 'CRITICA',
      estado: 'EN_PREPARACION',
      solicitadoPor: 'Dra. Suárez',
      comentarios: 'Post-operatorio complejo. Prioridad máxima.',
    },
    {
      id: 'p-1004',
      fechaHora: '17/03/2024 · 11:04',
      servicio: 'Terapia Intensiva',
      componente: 'Sangre',
      grupoSanguineo: 'A+',
      cantidad: 2,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Peña',
      comentarios: 'Cambio de indicación clínica.',
    },
    {
      id: 'p-1001',
      fechaHora: '18/03/2024 · 08:30',
      servicio: 'UTI',
      componente: 'Sangre',
      grupoSanguineo: 'O-',
      cantidad: 2,
      prioridad: 'NORMAL',
      estado: 'PENDIENTE',
      solicitadoPor: 'Dra. Lopez',
      comentarios: 'Paciente crítico en UTI, se requiere disponibilidad inmediata.',
    },
    {
      id: 'p-1002',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plaquetas',
      grupoSanguineo: '—',
      cantidad: 4,
      prioridad: 'URGENTE',
      estado: 'PENDIENTE',
      solicitadoPor: 'Dr. Fernández',
    },
    {
      id: 'p-1003',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plasma',
      grupoSanguineo: 'AB+',
      cantidad: 1,
      prioridad: 'CRITICA',
      estado: 'EN_PREPARACION',
      solicitadoPor: 'Dra. Suárez',
      comentarios: 'Post-operatorio complejo. Prioridad máxima.',
    },
    {
      id: 'p-1004',
      fechaHora: '17/03/2024 · 11:04',
      servicio: 'Terapia Intensiva',
      componente: 'Sangre',
      grupoSanguineo: 'A+',
      cantidad: 2,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Peña',
      comentarios: 'Cambio de indicación clínica.',
    }
  ];

  pedidoSeleccionado: Pedido | null = null;

  onCrearNuevoPedido(): void {}

  onSelectPedido(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
  }

  onCerrarDetalle(): void {
    this.pedidoSeleccionado = null;
  }
}
