import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
  HospitalRequest,
  HospitalRequestPriority,
  HospitalRequestStatus,
  HospitalUnit,
  UpdateHospitalRequestRequest,
} from '../../../../../models/pedido';
import { PedidoService } from '../../../../../service/pedido_service';

type DropKey = 'prioridad' | 'estado';

@Component({
  selector: 'app-pedido-detalle',
  standalone: false,
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})


export class PedidoDetalle {
  @Input() pedido: HospitalRequest | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() pedidoActualizado = new EventEmitter<UpdateHospitalRequestRequest>();
  constructor(private pedidoService: PedidoService) {}

  editMode = false;
  draft: HospitalRequest | null = null;
  errorMsg = '';

  servicios: HospitalUnit[] = [
    'ITU',
    'Terapia Intensiva',
    'Guardia',
    'Quirofano',
    'Clinica Medica',
  ];

  prioridades: HospitalRequestPriority[] = ['NORMAL', 'URGENTE', 'CRITICA'];

  // ❌ COMPLETO fuera
  estados: HospitalRequestStatus[] = ['ACTIVO', 'CANCELADO', 'FINALIZADO'];

  dropdownOpen: Record<DropKey, boolean> = {
    prioridad: false,
    estado: false,
  };

  empezarEdicion(): void {
    if (!this.pedido) return;
    this.editMode = true;
    this.errorMsg = '';
    this.draft = { ...this.pedido };
  }

  cancelarEdicion(): void {
    this.reset();
  }

  guardar(): void {
    if (!this.draft || !this.pedido) return;

    if (!this.draft.hospital_unit) {
      this.errorMsg = 'El servicio es obligatorio.';
      return;
    }

    const body = {
      hospital_unit: this.draft.hospital_unit,
      priority: this.draft.priority,
      status: this.draft.status,
      comments: this.draft.comments?.trim() || null,
    };

    this.pedidoService
      .updateHospitalRequest(this.pedido.id, body)
      .subscribe({
        next: (updated: HospitalRequest) => {
          this.pedidoActualizado.emit(updated);
          this.editMode = false;
          this.draft = null;
          this.errorMsg = '';
          this.dropdownOpen.prioridad = false;
          this.dropdownOpen.estado = false;
        },
        error: (err: any) => {
          console.error('Error actualizando pedido', err);
          this.errorMsg = 'No se pudo guardar el pedido.';
        },
      });
  }


  close(): void {
    this.reset();
    this.cerrar.emit();
  }

  private reset(): void {
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

  selectPrioridad(p: HospitalRequestPriority): void {
    if (!this.draft) return;
    this.draft.priority = p;
    this.dropdownOpen.prioridad = false;
  }

  selectEstado(e: HospitalRequestStatus): void {
    if (!this.draft) return;
    this.draft.status = e;
    this.dropdownOpen.estado = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    const target = ev.target as HTMLElement | null;
    if (!target || target.closest('.dropdown')) return;
    this.dropdownOpen.prioridad = false;
    this.dropdownOpen.estado = false;
  }

  prioridadLabel(p: HospitalRequestPriority): string {
  if (p === 'CRITICA') return 'Crítica';
  if (p === 'URGENTE') return 'Urgente';
  return 'Normal'; 
  }

  estadoLabel(e: HospitalRequestStatus): string {
  if (e === 'ACTIVO') return 'Activo';
  if (e === 'COMPLETO') return 'Completo';
  if (e === 'CANCELADO') return 'Cancelado';
  if (e === 'FINALIZADO') return 'Finalizado';
  return e;
}


}
