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
  @Input() pendientesMap: Record<string, number> = {};

  @Output() selectPedido = new EventEmitter<HospitalRequest>();

  onRowClick(pedido: HospitalRequest): void {
    this.selectPedido.emit(pedido);
  }

  estadoLabel(e: HospitalRequest['status']): string {
    if (e === 'ACTIVO') return 'Activo';
    if (e === 'COMPLETO') return 'Completo';
    if (e === 'CANCELADO') return 'Cancelado';
    if (e === 'FINALIZADO') return 'Finalizado';
    return e;
  }

  formatFecha(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
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
