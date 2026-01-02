import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HospitalRequest } from '../../../../../models/pedido';

@Component({
  selector: 'app-pedidos-table',
  standalone: false,
  templateUrl: './pedidos-table.html',
  styleUrl: './pedidos-table.scss',
})
export class PedidosTable {
  @Input() pedidos: HospitalRequest[] = [];
  @Input() pedidoSeleccionadoId: string | null = null;
  @Input() cargando = false;

  @Output() selectPedido = new EventEmitter<HospitalRequest>();

  onRowClick(pedido: HospitalRequest): void {
    this.selectPedido.emit(pedido);
  }

  prioridadLabel(p: HospitalRequest['priority']): string {
    if (p === 'CRITICA') return 'Crítica';
    if (p === 'URGENTE') return 'Urgente';
    return 'Normal';
  }

  estadoLabel(e: HospitalRequest['status']): string {
    if (e === 'ACTIVO') return 'Activo';
    if (e === 'COMPLETO') return 'Completo';
    if (e === 'CANCELADO') return 'Cancelado';
    if (e === 'FINALIZADO') return 'Finalizado';
    return e;
  }

  componenteLabel(p: HospitalRequest): string {
    const bg = p.blood_group ? ` ${p.blood_group}` : '';
    return `${p.component}${bg}`;
  }

  toLitros(ml: number): string {
    const litros = ml / 1000;
    const txt = Number.isInteger(litros) ? litros.toString() : litros.toFixed(2);
    return `${txt} L`;
  }

  formatFechaHora(iso: string): string {
  if (!iso) return '';

  const d = new Date(iso);

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} · ${hh}:${min}`;
}

}
