import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  HospitalRequest,
  HospitalRequestStatus,
  HospitalUnit,
  CancelRequestResponse,
  PendingClassificationItem,
} from '../../../../../models/pedido';
import { PedidoService } from '../../../../../service/pedido_service';
import { TurnoService } from '../../../../../service/turno_service';
import { ComponenteSanguineo } from '../../../../../models/blood-bank.model';
import { firstValueFrom } from 'rxjs';

type DropKey = 'estado';

@Component({
  selector: 'app-pedido-detalle',
  standalone: false,
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})
export class PedidoDetalle implements OnChanges {
  @Input() pedido: HospitalRequest | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() pedidoActualizado = new EventEmitter<HospitalRequest>();
  @Output() pedidoCancelado = new EventEmitter<HospitalRequest>();
  @Output() pendientesChanged = new EventEmitter<number>();

  constructor(
    private pedidoService: PedidoService,
    private turnoService: TurnoService,
    private cdr: ChangeDetectorRef
  ) {}

  editMode = false;
  draft: HospitalRequest | null = null;
  errorMsg = '';

  showCancelStep1 = false;
  showCancelStep2 = false;
  cancelLoading = false;
  cancelError = '';
  cancelSuccessMsg = '';

  // ─── Pendientes de clasificación ─────────────────────────────────────────
  pendientesModalOpen = false;
  pendientesLoaded = false;
  cargandoPendientes = false;
  pendientesClasificacion: PendingClassificationItem[] = [];

  clasificarTurno: PendingClassificationItem | null = null;
  clasificarComponentes: Record<ComponenteSanguineo, boolean> = {
    globulos_rojos: false,
    plasma: false,
    plaquetas: false,
  };
  clasificarLoading = false;
  clasificarError = '';
  clasificarExito = false;

  servicios: HospitalUnit[] = [
    'Urgencias',
    'Terapia Intensiva',
    'Guardia',
    'Quirofano',
    'Clinica Medica',
  ];

  estados: HospitalRequestStatus[] = ['ACTIVO', 'COMPLETO', 'CANCELADO', 'FINALIZADO'];

  dropdownOpen: Record<DropKey, boolean> = {
    estado: false,
  };

  readonly componenteOpciones: { value: ComponenteSanguineo; label: string; hint: string }[] = [
    { value: 'globulos_rojos', label: 'Glóbulos Rojos', hint: '42 días de vida útil' },
    { value: 'plasma', label: 'Plasma', hint: '365 días de vida útil' },
    { value: 'plaquetas', label: 'Plaquetas', hint: '5 días de vida útil' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedido'] && !changes['pedido'].firstChange) {
      this.pendientesClasificacion = [];
      this.pendientesLoaded = false;
      this.cargandoPendientes = false;
      this.pendientesModalOpen = false;
      this.clasificarTurno = null;
      this.reset();
    }
  }

  // ─── Conteo visible de pendientes ────────────────────────────────────────

  get pendingCount(): number {
    if (this.pendientesLoaded) return this.pendientesClasificacion.length;
    return this.pedido?.pending_classifications_count ?? 0;
  }

  // ─── Popup de pendientes ─────────────────────────────────────────────────

  openPendientesModal(): void {
    this.pendientesModalOpen = true;
    if (!this.pendientesLoaded) {
      this.loadPendientesClasificacion();
    }
  }

  closePendientesModal(): void {
    if (this.clasificarLoading) return;
    this.pendientesModalOpen = false;
    this.clasificarTurno = null;
    this.clasificarError = '';
    this.clasificarExito = false;
  }

  private loadPendientesClasificacion(): void {
    if (!this.pedido) return;
    this.cargandoPendientes = true;
    this.pendientesClasificacion = [];

    this.pedidoService.getPendingClassifications(this.pedido.id).subscribe({
      next: (res) => {
        this.pendientesClasificacion = res.items;
        this.cargandoPendientes = false;
        this.pendientesLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pendientesClasificacion = [];
        this.cargandoPendientes = false;
        this.pendientesLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Clasificación ───────────────────────────────────────────────────────

  openClasificar(turno: PendingClassificationItem): void {
    this.clasificarTurno = turno;
    this.clasificarComponentes = { globulos_rojos: false, plasma: false, plaquetas: false };
    this.clasificarError = '';
    this.clasificarExito = false;
    this.clasificarLoading = false;
  }

  closeClasificar(): void {
    if (this.clasificarLoading) return;
    this.clasificarTurno = null;
    this.clasificarError = '';
    this.clasificarExito = false;
  }

  get clasificarComponentesSeleccionados(): ComponenteSanguineo[] {
    return (Object.keys(this.clasificarComponentes) as ComponenteSanguineo[]).filter(
      (k) => this.clasificarComponentes[k]
    );
  }

  get clasificarPuedeConfirmar(): boolean {
    return this.clasificarComponentesSeleccionados.length > 0 && !this.clasificarLoading;
  }

  async confirmarClasificacion(): Promise<void> {
    if (!this.clasificarTurno || !this.clasificarPuedeConfirmar) return;

    this.clasificarLoading = true;
    this.clasificarError = '';

    try {
      await firstValueFrom(
        this.turnoService.clasificarComponentes(
          this.clasificarTurno.appointment_id,
          this.clasificarComponentesSeleccionados
        )
      );

      const removedId = this.clasificarTurno!.appointment_id;
      this.clasificarExito = true;
      this.pendientesClasificacion = this.pendientesClasificacion.filter(
        (t) => t.appointment_id !== removedId
      );
      this.pendientesChanged.emit(this.pendientesClasificacion.length);

      setTimeout(() => {
        this.clasificarTurno = null;
        this.clasificarExito = false;
      }, 1500);
    } catch (e: any) {
      this.clasificarError = e?.error?.detail ?? e?.message ?? 'Error al clasificar.';
    } finally {
      this.clasificarLoading = false;
    }
  }

  componenteLabel(c: ComponenteSanguineo): string {
    const labels: Record<ComponenteSanguineo, string> = {
      globulos_rojos: 'Glóbulos Rojos',
      plasma: 'Plasma',
      plaquetas: 'Plaquetas',
    };
    return labels[c];
  }

  // ─── Edición pedido ───────────────────────────────────────────────────────

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
      status: this.draft.status,
      comments: this.draft.comments?.trim() || null,
    };

    this.pedidoService.updateHospitalRequest(this.pedido.id, body).subscribe({
      next: (updated: HospitalRequest) => {
        this.pedidoActualizado.emit(updated);
        this.close();
      },
      error: (err: any) => {
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
    this.dropdownOpen.estado = false;
    this.showCancelStep1 = false;
    this.showCancelStep2 = false;
    this.cancelLoading = false;
    this.cancelError = '';
    this.cancelSuccessMsg = '';
  }

  toggleDropdown(key: DropKey): void {
    const next = !this.dropdownOpen[key];
    this.dropdownOpen.estado = false;
    this.dropdownOpen[key] = next;
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
    this.dropdownOpen.estado = false;
  }

  estadoLabel(e: HospitalRequestStatus): string {
    if (e === 'ACTIVO') return 'Activo';
    if (e === 'COMPLETO') return 'Completo';
    if (e === 'CANCELADO') return 'Cancelado';
    if (e === 'FINALIZADO') return 'Finalizado';
    return e;
  }
}
