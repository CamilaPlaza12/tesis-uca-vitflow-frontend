import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pedido } from '../../../../../models/pedido';

@Component({
  selector: 'app-pedido-detalle',
  standalone: false,
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})
export class PedidoDetalle {@Input() pedido: Pedido | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() pedidoActualizado = new EventEmitter<Pedido>();

  editMode = false;
  draft: Pedido | null = null;
  errorMsg = '';

  servicios: string[] = ['UTI', 'Terapia Intensiva', 'Guardia', 'Quirófano', 'Clínica Médica'];
  prioridades: Pedido['prioridad'][] = ['NORMAL', 'URGENTE', 'CRITICA'];
  estados: Pedido['estado'][] = ['PENDIENTE', 'EN_PREPARACION', 'CANCELADO', 'RECHAZADO'];

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
    this.editMode = false;
    this.draft = null;
    this.errorMsg = '';
    this.cerrar.emit();
  }

  empezarEdicion(): void {
    if (!this.pedido) return;
    this.editMode = true;
    this.errorMsg = '';
    this.draft = { ...this.pedido };
  }

  cancelarEdicion(): void {
    this.editMode = false;
    this.draft = null;
    this.errorMsg = '';
  }

  guardar(): void {
    if (!this.draft) return;

    const cantidad = Number(this.draft.cantidad);
    if (!Number.isFinite(cantidad) || cantidad < 1) {
      this.errorMsg = 'La cantidad debe ser un número mayor o igual a 1.';
      return;
    }

    if (!this.draft.servicio || this.draft.servicio.trim().length < 2) {
      this.errorMsg = 'El servicio es obligatorio.';
      return;
    }

    this.draft.cantidad = cantidad;
    this.draft.servicio = this.draft.servicio.trim();
    this.draft.comentarios = (this.draft.comentarios ?? '').trim() || undefined;

    this.pedidoActualizado.emit({ ...this.draft });

    this.editMode = false;
    this.draft = null;
    this.errorMsg = '';
  }
}
