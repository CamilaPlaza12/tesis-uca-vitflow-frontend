import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Turno } from '../../../models/turno';
import { AccionTurno } from './turno-actions.policy';
import { AvailabilityDay, HospitalAvailability } from '../../../models/disponibilidad';
import { TurnoService } from '../../../service/turno_service';
import { AvailabilityService } from '../../../service/availability_service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-turnos',
  standalone: false,
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class Turnos implements OnInit {
  today = new Date();

  disponibilidad: AvailabilityDay[] | null = null;

  availabilityLoading = false;
  availabilityLoaded = false;

  availabilityConfigOpen = false;
  availabilityConfigClosing = false;
  private readonly configAnimMs = 220;

  availabilitySaving = false;
  availabilitySaveError = '';

  turnos: Turno[] = [];
  turnoSeleccionado: Turno | null = null;

  reprogramOpen = false;
  reprogramDate = '';
  reprogramTime = '';
  reprogramMinDate = '';

  modalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Confirmar';
  modalLoading = false;
  modalError: string | null = null;

  private accionPendiente: AccionTurno | null = null;

  turnosHistorico: Turno[] = [];
  loadingHistorico = false;
  errorHistorico = '';

  constructor(
    private turnoService: TurnoService,
    private availabilityService: AvailabilityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTurnos();
    this.loadDisponibilidad();
  }

  private loadTurnos(): void {
    this.turnoService.getTurnosWindowMonths().subscribe({
      next: (rows) => (this.turnos = rows ?? []),
      error: (e) => {
        console.error('Error al cargar turnos:', e);
        this.turnos = [];
      },
    });
  }

  private loadDisponibilidad(): void {
    this.availabilityLoading = true;
    this.availabilityLoaded = false;

    this.availabilityService.getHospitalAvailability().subscribe({
      next: (payload) => {
        this.disponibilidad = payload?.days ?? null;
      },
      error: (e) => {
        console.error('Error al cargar disponibilidad:', e);
        this.disponibilidad = null;
      },
      complete: () => {
        this.availabilityLoading = false;
        this.availabilityLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  get hasDisponibilidad(): boolean {
    return !!this.disponibilidad && this.disponibilidad.some((d) => d.enabled);
  }

  get showOnboarding(): boolean {
    return this.availabilityLoaded && !this.hasDisponibilidad;
  }

  get showAgenda(): boolean {
    return this.availabilityLoaded && this.hasDisponibilidad;
  }

  get isReprogramAction(): boolean {
    return this.accionPendiente === 'REPROGRAMAR';
  }

  private blurActiveElement(): void {
    try {
      (document.activeElement as HTMLElement | null)?.blur();
    } catch {}
  }

  // =========================
  // Config disponibilidad
  // =========================

  openConfigFromOnboarding(): void {
    this.availabilitySaveError = '';
    this.availabilityConfigClosing = false;
    this.availabilityConfigOpen = true;
  }

  toggleConfigFromBottom(): void {
    // ✅ Toggle simple, cero scroll
    this.availabilitySaveError = '';
    this.availabilityConfigClosing = false;

    if (this.availabilityConfigOpen) {
      this.closeAvailabilityConfig();
    } else {
      this.availabilityConfigOpen = true;
    }
  }

  onCancelConfigurar(): void {
    this.closeAvailabilityConfig();
  }

  onSaveDisponibilidad(days: AvailabilityDay[]): void {
    if (this.availabilitySaving) return;

    this.availabilitySaving = true;
    this.availabilitySaveError = '';

    const payload: HospitalAvailability = { days };

    this.availabilityService.saveHospitalAvailability(payload).subscribe({
      next: (saved) => {
        this.disponibilidad = saved?.days ?? days;
        this.closeAvailabilityConfig();
      },
      error: (e) => {
        console.error('Error al guardar disponibilidad:', e);
        this.availabilitySaveError =
          e?.error?.detail ?? 'No se pudo guardar la disponibilidad. Revisá el backend/token.';
      },
      complete: () => {
        this.availabilitySaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  private closeAvailabilityConfig(): void {
    if (this.availabilityConfigClosing) return;

    this.blurActiveElement();

    this.availabilityConfigOpen = false;
    this.availabilityConfigClosing = true;

    setTimeout(() => {
      this.availabilityConfigClosing = false;
      this.blurActiveElement();
    }, this.configAnimMs + 20);
  }

  // =========================
  // Turnos + modal
  // =========================

  onSelectTurnoFromCalendar(turno: Turno): void {
    this.turnoSeleccionado = turno;
  }

  requestAction(accion: AccionTurno, turno: Turno): void {
    this.turnoSeleccionado = turno;
    this.accionPendiente = accion;

    this.modalError = null;
    this.modalLoading = false;
    this.modalTitle = this.getModalTitle(accion);
    this.modalConfirmText = this.getModalConfirmText(accion);
    this.modalMessage = this.getModalMessage(accion, turno);

    this.reprogramOpen = false;
    if (accion === 'REPROGRAMAR') {
      this.reprogramOpen = true;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.reprogramMinDate = this.toDateStr(tomorrow);
      this.reprogramDate = this.reprogramMinDate;
      this.reprogramTime = turno.time_local || '09:00';
    }

    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.modalLoading) return;
    this.modalOpen = false;
    this.modalError = null;
    this.accionPendiente = null;
  }

  async confirmModal(): Promise<void> {
    if (!this.turnoSeleccionado || !this.accionPendiente) return;

    this.modalLoading = true;
    this.modalError = null;

    try {
      const t = this.turnoSeleccionado;
      let res: Turno;

      if (this.accionPendiente === 'CONFIRMAR') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'CONFIRMADO'));
      } else if (this.accionPendiente === 'CANCELAR') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'CANCELADO'));
      } else if (this.accionPendiente === 'REPROGRAMAR') {
        res = await firstValueFrom(this.turnoService.reschedule(t.id, this.reprogramDate, this.reprogramTime));
      } else {
        throw new Error('Acción no reconocida');
      }

      const idx = this.turnos.findIndex((x) => x.id === res.id);
      if (idx !== -1) this.turnos[idx] = res;

      this.modalOpen = false;
      this.accionPendiente = null;
    } catch (e: any) {
      this.modalError = e?.message ?? 'Ocurrió un error inesperado.';
    } finally {
      this.modalLoading = false;
    }
  }

  private toDateStr(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private getModalTitle(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar turno';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    return 'Reprogramar turno';
  }

  private getModalConfirmText(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    return 'Reprogramar';
  }

  private getModalMessage(accion: AccionTurno, turno: Turno): string {
    const base = `Donante: ${turno.donor?.full_name ?? '—'} · ${turno.date_local} ${turno.time_local}`;
    if (accion === 'CONFIRMAR') return `${base}\n¿Confirmás este turno?`;
    if (accion === 'CANCELAR') return `${base}\n¿Querés cancelar este turno?`;
    return `${base}\n¿Reprogramar?`;
  }

  onSearchHistorico(e: { desde: string; hasta: string }): void {
    this.loadingHistorico = true;
    this.errorHistorico = '';

    this.turnoService.getTurnosByRange(e.desde, e.hasta).subscribe({
      next: (rows) => {
        this.turnosHistorico = rows ?? [];
        this.loadingHistorico = false;
      },
      error: (err) => {
        console.error(err);
        this.turnosHistorico = [];
        this.errorHistorico = 'No se pudo cargar el histórico';
        this.loadingHistorico = false;
      },
    });
  }

  onClearHistorico(): void {
    this.turnosHistorico = [];
  }
}
