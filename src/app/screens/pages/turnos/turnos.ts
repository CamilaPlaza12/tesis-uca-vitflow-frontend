import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Turno } from '../../../models/turno';
import { AccionTurno, canClasificar } from './turno-actions.policy';
import { AvailabilityDay, HospitalAvailability } from '../../../models/disponibilidad';
import { TurnoService, UnidadCreada, ClasificarComponentesResponse } from '../../../service/turno_service';
import { AvailabilityService } from '../../../service/availability_service';
import { ComponenteSanguineo } from '../../../models/blood-bank.model';
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

  // ─── Clasificación de componentes ──────────────────────────────────────────
  donacionModalOpen = false;
  donacionTurno: Turno | null = null;
  donacionBloodGroup: string = '';
  donacionComponentes: Record<ComponenteSanguineo, boolean> = {
    globulos_rojos: false,
    plasma: false,
    plaquetas: false,
  };
  donacionLoading = false;
  donacionError = '';
  donacionResultado: ClasificarComponentesResponse | null = null;

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

  // ─── Disponibilidad para reprogramación ────────────────────────────────────

  get reprogramAvailableDates(): string[] {
    if (!this.disponibilidad) return [];
    const enabledNums = this.disponibilidad
      .filter((d) => d.enabled && d.timeSlots.length > 0)
      .map((d) => this.weekdayToNumber(d.day));

    const dates: string[] = [];
    const base = new Date();
    for (let i = 1; i <= 60; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      if (enabledNums.includes(d.getDay())) {
        dates.push(this.toDateStr(d));
      }
    }
    return dates;
  }

  get reprogramAvailableTimes(): string[] {
    if (!this.disponibilidad || !this.reprogramDate) return [];
    const [y, m, day] = this.reprogramDate.split('-').map(Number);
    const date = new Date(y, m - 1, day);
    const weekdayName = this.getWeekdayName(date.getDay());
    const dayConfig = this.disponibilidad.find((x) => x.day === weekdayName);
    if (!dayConfig?.enabled) return [];
    return dayConfig.timeSlots.map((s) => s.time);
  }

  private weekdayToNumber(day: string): number {
    const map: Record<string, number> = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miercoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sabado: 6,
    };
    return map[day] ?? -1;
  }

  private getWeekdayName(dayNum: number): string {
    return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][dayNum];
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
    // CLASIFICAR: abre el modal de componentes (turno ya en PENDIENTE_CLASIFICACION)
    if (accion === 'CLASIFICAR') {
      this.turnoSeleccionado = turno;
      this.openDonacionModal(turno);
      return;
    }

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

      // Usar primera fecha disponible por disponibilidad del hospital
      const availableDates = this.reprogramAvailableDates;
      this.reprogramDate = availableDates[0] ?? this.reprogramMinDate;

      // Primera hora disponible para esa fecha
      const [y, m, day] = this.reprogramDate.split('-').map(Number);
      const date = new Date(y, m - 1, day);
      const weekdayName = this.getWeekdayName(date.getDay());
      const dayConfig = this.disponibilidad?.find((x) => x.day === weekdayName);
      const firstTime = dayConfig?.enabled ? dayConfig.timeSlots[0]?.time : null;
      this.reprogramTime = firstTime ?? turno.time_local ?? '09:00';
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
      } else if (this.accionPendiente === 'COMPLETAR') {
        // Paso 1: confirmar asistencia → PENDIENTE_CLASIFICACION (sin body)
        await firstValueFrom(this.turnoService.confirmarAsistencia(t.id));
        // El backend actualiza last_donation_date; actualizamos el turno localmente
        res = { ...t, status: 'PENDIENTE_CLASIFICACION' as const };
      } else if (this.accionPendiente === 'CANCELAR') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'CANCELADO'));
      } else if (this.accionPendiente === 'REPROGRAMAR') {
        res = await firstValueFrom(
          this.turnoService.reschedule(t.id, this.reprogramDate, this.reprogramTime)
        );
      } else if (this.accionPendiente === 'NO_PRESENTADO') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'NO_PRESENTADO'));
      } else {
        throw new Error('Acción no reconocida');
      }

      // Actualización inmutable para disparar change detection + sincronizar detalle
      this.turnos = this.turnos.map((x) => (x.id === res.id ? res : x));
      this.turnoSeleccionado = res;

      this.modalOpen = false;
      this.accionPendiente = null;
    } catch (e: any) {
      this.modalError = e?.error?.detail ?? e?.message ?? 'Ocurrió un error inesperado.';
    } finally {
      this.modalLoading = false;
    }
  }

  // =========================
  // Clasificación de componentes
  // =========================

  openDonacionModal(turno: Turno): void {
    this.donacionTurno = turno;
    this.donacionBloodGroup = turno.blood_group || turno.donor?.blood_group || '';
    this.donacionComponentes = {
      globulos_rojos: false,
      plasma: false,
      plaquetas: false,
    };
    this.donacionError = '';
    this.donacionResultado = null;
    this.donacionLoading = false;
    this.donacionModalOpen = true;
  }

  closeDonacionModal(): void {
    if (this.donacionLoading) return;
    this.donacionModalOpen = false;
    this.donacionTurno = null;
    this.donacionResultado = null;
  }

  get donacionTieneResultado(): boolean {
    return this.donacionResultado !== null;
  }

  get donacionComponentesSeleccionados(): ComponenteSanguineo[] {
    return (Object.keys(this.donacionComponentes) as ComponenteSanguineo[]).filter(
      (k) => this.donacionComponentes[k]
    );
  }

  get donacionPuedeConfirmar(): boolean {
    return this.donacionComponentesSeleccionados.length > 0 && !this.donacionLoading;
  }

  async confirmDonacion(): Promise<void> {
    if (!this.donacionTurno || !this.donacionPuedeConfirmar) return;

    this.donacionLoading = true;
    this.donacionError = '';

    try {
      const result = await firstValueFrom(
        this.turnoService.clasificarComponentes(
          this.donacionTurno.id,
          this.donacionComponentesSeleccionados
        )
      );
      this.donacionResultado = result;

      // Actualizar turno a COMPLETADO de forma inmutable
      const id = this.donacionTurno.id;
      this.turnos = this.turnos.map((x) =>
        x.id === id ? { ...x, status: 'COMPLETADO' as const } : x
      );
      const updated = this.turnos.find((x) => x.id === id);
      if (updated) this.turnoSeleccionado = updated;
    } catch (e: any) {
      this.donacionError =
        e?.error?.detail ?? e?.message ?? 'Error al registrar la donación.';
    } finally {
      this.donacionLoading = false;
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

  formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
  }

  // =========================
  // Histórico
  // =========================

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

  // =========================
  // Helpers
  // =========================

  private toDateStr(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private getModalTitle(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar turno';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    if (accion === 'COMPLETAR') return 'Marcar asistencia';
    if (accion === 'NO_PRESENTADO') return 'No se presentó';
    return 'Reprogramar turno';
  }

  private getModalConfirmText(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    if (accion === 'COMPLETAR') return 'Confirmar asistencia';
    if (accion === 'NO_PRESENTADO') return 'Marcar ausencia';
    return 'Reprogramar';
  }

  private getModalMessage(accion: AccionTurno, turno: Turno): string {
    const base = `Donante: ${turno.donor?.full_name ?? '—'} · ${turno.date_local} ${turno.time_local}`;
    if (accion === 'CONFIRMAR') return `${base}\n¿Confirmás este turno?`;
    if (accion === 'CANCELAR') return `${base}\n¿Querés cancelar este turno?`;
    if (accion === 'COMPLETAR')
      return `${base}\n¿El donante se presentó? El turno pasará a "Pendiente de clasificación".`;
    if (accion === 'NO_PRESENTADO') return `${base}\n¿El donante no se presentó?`;
    return `${base}\n¿Reprogramar?`;
  }
}
