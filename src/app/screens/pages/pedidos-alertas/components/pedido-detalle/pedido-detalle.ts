import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pedido } from '../../../../../models/pedido';

@Component({
  selector: 'app-pedido-detalle',
  standalone: false,
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})
export class PedidoDetalle {
  @Input() pedido: Pedido | null = null;
  @Output() cerrar = new EventEmitter<void>();

  prioridadLabel(p: Pedido['prioridad']): string {
    if (p === 'CRITICA') return 'Crítica';
    if (p === 'URGENTE') return 'Urgente';
    return 'Normal';
  }

  estadoLabel(e: Pedido['estado']): string {
    if (e === 'EN_PREPARACION') return 'En preparación';
    if (e === 'PENDIENTE') return 'Pendiente';
    if (e === 'CANCELADO') return 'Cancelado';
    return 'Rechazado';
  }

  close(): void {
    this.cerrar.emit();
  }
}
