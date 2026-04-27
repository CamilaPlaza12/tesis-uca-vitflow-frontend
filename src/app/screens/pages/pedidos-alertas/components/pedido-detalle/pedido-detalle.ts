import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
  HospitalRequest,
  HospitalRequestPriority,
  HospitalRequestStatus,
  HospitalUnit,
} from '../../../../../models/pedido';
import { PedidoService } from '../../../../../service/pedido_service';
import { CancelRequestResponse } from '../../../../../models/pedido';

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
  @Output() pedidoActualizado = new EventEmitter<HospitalRequest>();
  @Output() pedidoCancelado = new EventEmitter<HospitalRequest>();

  constructor(private pedidoService: PedidoService) {}

  editMode = false;
  draft: HospitalRequest | null = null;
  errorMsg = '';

  showCancelStep1 = false;
  showCancelStep2 = false;
  cancelLoading = false;
  cancelError = '';
  cancelSuccessMsg = '';

  servicios: HospitalUnit[] = [
    'ITU',
    'Terapia Intensiva',
    'Guardia',
    'Quirofano',
    'Clinica Medica',
  ];

  prioridades: HospitalRequestPriority[] = ['NORMAL', 'URGENTE', 'CRITICA'];
  estados: HospitalRequestStatus[] = ['ACTIVO', 'COMPLETO', 'CANCELADO', 'FINALIZADO'];

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

  puedeEditar(): boolean {
    if (!this.pedido) return false;
    return this.pedido.status === 'ACTIVO';
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

    this.pedidoService.updateHospitalRequest(this.pedido.id, body).subscribe({
      next: (updated: HospitalRequest) => {
        // 1) aviso al padre
        this.pedidoActualizado.emit(updated);

        // 2) cierro el detalle (así al reabrir ya se ve con el refresh del padre)
        this.close();
      },
      error: (err: any) => {
        console.error('Error actualizando pedido', err);
        this.errorMsg = 'No se pudo guardar el pedido.';
      },
    });
  }

  puedeCancelar(): boolean {
    if (!this.pedido) return false;
    return !(['CANCELADO', 'COMPLETO', 'FINALIZADO'] as HospitalRequestStatus[]).includes(
      this.pedido.status
    );
  }

  onClickCancelar(): void {
    if (!this.puedeCancelar() || this.cancelLoading) return;
    this.cancelError = '';
    this.cancelSuccessMsg = '';
    this.showCancelStep1 = true;
  }

  onConfirmStep1(): void {
    this.showCancelStep1 = false;
    this.showCancelStep2 = true;
  }

  onAbortCancel(): void {
    this.showCancelStep1 = false;
    this.showCancelStep2 = false;
    this.cancelError = '';
  }

  onConfirmStep2(): void {
    if (!this.pedido || this.cancelLoading) return;
    this.cancelLoading = true;
    this.cancelError = '';

    this.pedidoService.cancelHospitalRequest(this.pedido.id).subscribe({
      next: (res: CancelRequestResponse) => {
        this.cancelLoading = false;
        this.showCancelStep2 = false;

        this.pedido = { ...this.pedido!, status: 'CANCELADO' };
        this.pedidoCancelado.emit(this.pedido);

        const n = res.cancelled_appointments;
        const d = res.donor_ids_to_notify.length;
        if (n === 0) {
          this.cancelSuccessMsg = 'Pedido cancelado. No había turnos activos.';
        } else if (d === 0) {
          this.cancelSuccessMsg = `Pedido cancelado. Se cancelaron ${n} turno${n !== 1 ? 's' : ''}.`;
        } else {
          this.cancelSuccessMsg =
            `Pedido cancelado. Se cancelaron ${n} turno${n !== 1 ? 's' : ''} ` +
            `y se notificará a ${d} donante${d !== 1 ? 's' : ''}.`;
        }
      },
      error: (err: any) => {
        this.cancelLoading = false;
        if (err.status === 401) {
          this.cancelError = 'Sesión expirada. Volvé a iniciar sesión.';
        } else if (err.status === 404) {
          this.cancelError = 'El pedido no fue encontrado.';
        } else if (err.status === 409) {
          this.cancelError =
            err?.error?.detail || 'No se puede cancelar este pedido en su estado actual.';
        } else {
          this.cancelError = 'Error al cancelar el pedido. Intentá de nuevo.';
        }
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
    this.showCancelStep1 = false;
    this.showCancelStep2 = false;
    this.cancelLoading = false;
    this.cancelError = '';
    this.cancelSuccessMsg = '';
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
