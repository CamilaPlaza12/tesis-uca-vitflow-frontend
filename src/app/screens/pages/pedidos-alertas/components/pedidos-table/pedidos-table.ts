import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pedido } from '../../../../../models/pedido';

@Component({
  selector: 'app-pedidos-table',
  standalone: false,
  templateUrl: './pedidos-table.html',
  styleUrl: './pedidos-table.scss',
})
export class PedidosTable {
  @Input() pedidos: Pedido[] = [];
  @Input() pedidoSeleccionadoId: string | null = null;

  @Output() selectPedido = new EventEmitter<Pedido>();

  onRowClick(pedido: Pedido): void {
    this.selectPedido.emit(pedido);
  }

  prioridadLabel(p: Pedido['prioridad']): string {
    if (p === 'CRITICA') return 'Crítica';
    if (p === 'URGENTE') return 'Urgente';
    return 'Normal';
  }

  estadoLabel(e: Pedido['estado']): string {
    if (e === 'ACTIVO') return 'Activo';
    if (e === 'COMPLETO') return 'Competo';
    if (e === 'CANCELADO') return 'Cancelado';
    return 'Rechazado';
  }

  componenteLabel(p: Pedido): string {
    const gs = p.grupoSanguineo && p.grupoSanguineo !== '—' ? ` ${p.grupoSanguineo}` : '';
    return `${p.componente}${gs}`;
  }

   toLitros(ml: number): string {
    const litros = ml / 1000;
    const txt = Number.isInteger(litros) ? litros.toString() : litros.toFixed(2);
    return `${txt} L`;
  }
}
