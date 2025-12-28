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
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'ACTIVO',
      solicitadoPor: 'Dra. Lopez',
      comentarios: 'Paciente crítico en UTI, se requiere disponibilidad inmediata.',
    },
    {
      id: 'p-1002',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plaquetas',
      grupoSanguineo: '—',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'URGENTE',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Fernández',
    },
    {
      id: 'p-1003',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plasma',
      grupoSanguineo: 'AB+',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 2000,
      prioridad: 'CRITICA',
      estado: 'COMPLETO',
      solicitadoPor: 'Dra. Suárez',
      comentarios: 'Post-operatorio complejo. Prioridad máxima.',
    },
    {
      id: 'p-1004',
      fechaHora: '17/03/2024 · 11:04',
      servicio: 'Terapia Intensiva',
      componente: 'Sangre',
      grupoSanguineo: 'A+',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Peña',
      comentarios: 'Cambio de indicación clínica.',
    },
    {
      id: 'p-1005',
      fechaHora: '18/03/2024 · 08:30',
      servicio: 'UTI',
      componente: 'Sangre',
      grupoSanguineo: 'O-',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'ACTIVO',
      solicitadoPor: 'Dra. Lopez',
      comentarios: 'Paciente crítico en UTI, se requiere disponibilidad inmediata.',
    },
    {
      id: 'p-1006',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plaquetas',
      grupoSanguineo: '—',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'URGENTE',
      estado: 'ACTIVO',
      solicitadoPor: 'Dr. Fernández',
    },
    {
      id: 'p-1007',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plasma',
      grupoSanguineo: 'AB+',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'CRITICA',
      estado: 'ACTIVO',
      solicitadoPor: 'Dra. Suárez',
      comentarios: 'Post-operatorio complejo. Prioridad máxima.',
    },
    {
      id: 'p-1008',
      fechaHora: '17/03/2024 · 11:04',
      servicio: 'Terapia Intensiva',
      componente: 'Sangre',
      grupoSanguineo: 'A+',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Peña',
      comentarios: 'Cambio de indicación clínica.',
    },
    {
      id: 'p-1009',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plaquetas',
      grupoSanguineo: '—',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'URGENTE',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Fernández',
    },
    {
      id: 'p-1010',
      fechaHora: '18/03/2024 · 11:10',
      servicio: 'Terapia Intensiva',
      componente: 'Plasma',
      grupoSanguineo: 'AB+',
      cantidadSolicitadaMl: 900,
      cantidadObtenidaMl: 900,
      prioridad: 'CRITICA',
      estado: 'COMPLETO',
      solicitadoPor: 'Dra. Suárez',
      comentarios: 'Post-operatorio complejo. Prioridad máxima.',
    },
    {
      id: 'p-1011',
      fechaHora: '17/03/2024 · 11:04',
      servicio: 'Terapia Intensiva',
      componente: 'Sangre',
      grupoSanguineo: 'A+',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dr. Peña',
      comentarios: 'Cambio de indicación clínica.',
    },
    {
      id: 'p-1045',
      fechaHora: '18/03/2024 · 08:30',
      servicio: 'UTI',
      componente: 'Sangre',
      grupoSanguineo: 'O-',
      cantidadSolicitadaMl: 2000,
      cantidadObtenidaMl: 900,
      prioridad: 'NORMAL',
      estado: 'CANCELADO',
      solicitadoPor: 'Dra. Lopez',
      comentarios: 'Paciente crítico en UTI, se requiere disponibilidad inmediata.',
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

  onPedidoActualizado(pedido: Pedido): void {
    this.pedidos = this.pedidos.map(p => (p.id === pedido.id ? pedido : p));
    this.pedidoSeleccionado = pedido;
  }

}
