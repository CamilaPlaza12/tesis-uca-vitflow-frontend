import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Pedido } from '../../../../../models/pedido';

type DropKey = 'prioridad' | 'estado';

@Component({
  selector: 'app-pedido-detalle',
  standalone: false,
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})
export class PedidoDetalle {
  @Input() pedido: Pedido | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() pedidoActualizado = new EventEmitter<Pedido>();

  editMode = false;
  draft: Pedido | null = null;
  errorMsg = '';

  servicios: string[] = ['UTI', 'Terapia Intensiva', 'Guardia', 'Quirófano', 'Clínica Médica'];

  prioridades: Pedido['prioridad'][] = ['NORMAL', 'URGENTE', 'CRITICA'];
  estados: Pedido['estado'][] = ['ACTIVO', 'COMPLETO', 'CANCELADO'];

  dropdownOpen: Record<DropKey, boolean> = {
    prioridad: false,
    estado: false,
  };

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

  close(): void {
    this.editMode = false;
    this.draft = null;
    this.errorMsg = '';
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
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
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
  }

  guardar(): void {
    if (!this.draft) return;

    const cantidad = Number(this.draft.cantidadSolicitadaMl);
    if (!Number.isFinite(cantidad) || cantidad < 1) {
      this.errorMsg = 'La cantidad debe ser un número mayor o igual a 1.';
      return;
    }

    if (!this.draft.servicio || this.draft.servicio.trim().length < 2) {
      this.errorMsg = 'El servicio es obligatorio.';
      return;
    }

    this.draft.cantidadSolicitadaMl = cantidad;
    this.draft.servicio = this.draft.servicio.trim();
    this.draft.comentarios = (this.draft.comentarios ?? '').trim() || undefined;

    this.pedidoActualizado.emit({ ...this.draft });

    this.editMode = false;
    this.draft = null;
    this.errorMsg = '';
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
  }

  toggleDropdown(key: DropKey): void {
    const next = !this.dropdownOpen[key];
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
    this.dropdownOpen[key] = next;
  }

  selectPrioridad(p: Pedido['prioridad']): void {
    if (!this.draft) return;
    this.draft.prioridad = p;
    this.dropdownOpen.prioridad = false;
  }

  selectEstado(e: Pedido['estado']): void {
    if (!this.draft) return;
    this.draft.estado = e;
    this.dropdownOpen.estado = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.dropdown')) return;
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
  }
}
