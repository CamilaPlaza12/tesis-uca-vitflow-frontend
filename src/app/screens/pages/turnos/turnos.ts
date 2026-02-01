import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
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

  // No agregamos hospitalId aquí porque el back usa el token

  disponibilidad: AvailabilityDay[] | null = null;
  availabilityConfigOpen = false;
  availabilityConfigClosing = false;
  private readonly configAnimMs = 220;

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

  turnosCalendar: Turno[] = [];
  turnosHistorico: Turno[] = [];

  loadingHistorico = false;
  errorHistorico = '';


  @ViewChild('availabilityAnchor') availabilityAnchor?: ElementRef<HTMLElement>;
  @ViewChild('topAnchor') topAnchor?: ElementRef<HTMLElement>;

  constructor(
    private turnoService: TurnoService,
    private availabilityService: AvailabilityService
  ) {}

  ngOnInit(): void {
    this.loadTurnos();
    this.loadDisponibilidad();
  }

  private loadTurnos(): void {
    this.turnoService.getTurnosWindowMonths().subscribe({
      next: (rows) => {
        this.turnos = rows ?? [];
      },
      error: (e) => {
        console.error('Error al cargar turnos (window months):', e);
        this.turnos = [];
      },
    });
  }


  private loadDisponibilidad(): void {
    this.availabilityService.getHospitalAvailability().subscribe({
      next: (payload) => {
        console.log('DISPONIBILIDAD:', payload);
        this.disponibilidad = payload?.days ?? null;
      },
      error: () => {
        this.disponibilidad = null;
      },
    });
  }



  get hasDisponibilidad(): boolean {
    return !!this.disponibilidad && this.disponibilidad.some((d) => d.enabled);
  }

  get isReprogramAction(): boolean {
    return this.accionPendiente === 'REPROGRAMAR';
  }

  onClickConfigurar(): void {
    this.availabilityConfigClosing = false;
    this.availabilityConfigOpen = true;
    this.afterDom(() => this.scrollToAvailability());
  }

  onCancelConfigurar(): void {
    this.closeAvailabilityConfig(true);
  }

  onSaveDisponibilidad(days: AvailabilityDay[]): void {
    // El payload solo lleva los días
    const payload: HospitalAvailability = {
      days,
    };

    this.availabilityService
      .saveHospitalAvailability(payload)
      .subscribe({
        next: (saved) => {
          this.disponibilidad = saved?.days ?? days;
          this.closeAvailabilityConfig(true);
        },
        error: (e) => {
          console.error('Error al guardar disponibilidad:', e);
        },
      });
  }

  onEditDisponibilidad(): void {
    this.availabilityConfigClosing = false;
    this.availabilityConfigOpen = true;
    this.afterDom(() => this.scrollToAvailability());
  }

  onEditDisponibilidadFromHeader(): void {
    this.availabilityConfigClosing = false;
    this.availabilityConfigOpen = true;
    this.afterDom(() => this.scrollToAvailability());
  }

  private closeAvailabilityConfig(scrollUp = false): void {
    if (this.availabilityConfigClosing) return;
    this.availabilityConfigOpen = false;
    this.availabilityConfigClosing = true;
    setTimeout(() => {
      this.availabilityConfigClosing = false;
      if (scrollUp) {
        this.afterDom(() => this.scrollToTop());
      }
    }, this.configAnimMs + 20);
  }

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
      } else if (this.accionPendiente === 'COMPLETAR') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'COMPLETADO'));
      } else if (this.accionPendiente === 'NO_PRESENTADO') {
        res = await firstValueFrom(this.turnoService.updateStatus(t.id, 'NO_PRESENTADO'));
      } else if (this.accionPendiente === 'REPROGRAMAR') {
        // usa lo que el modal te va actualizando
        res = await firstValueFrom(
          this.turnoService.reschedule(t.id, this.reprogramDate, this.reprogramTime)
        );
      } else {
        throw new Error('Acción no reconocida');
      }


      const idx = this.turnos.findIndex((x) => x.id === res.id);
      if (idx !== -1) this.turnos[idx] = res;
      this.modalOpen = false;
      this.accionPendiente = null;
    } catch (e) {
      this.modalError = this.getErrorMessage(e);
    } finally {
      this.modalLoading = false;
    }
  }

  private toDateStr(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private scrollToAvailability(): void {
    this.availabilityAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  private scrollToTop(): void {
    this.topAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  private afterDom(fn: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  private getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    return 'Ocurrió un error inesperado.';
  }

  private getModalTitle(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar turno';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    if (accion === 'COMPLETAR') return 'Marcar asistencia';
    if (accion === 'NO_PRESENTADO') return 'Marcar no presentado';
    return 'Reprogramar turno';
  }

  private getModalConfirmText(accion: AccionTurno): string {
    if (accion === 'CONFIRMAR') return 'Confirmar';
    if (accion === 'CANCELAR') return 'Cancelar turno';
    if (accion === 'COMPLETAR') return 'Marcar como completado';
    if (accion === 'NO_PRESENTADO') return 'Marcar no presentado';
    return 'Reprogramar';
  }

  private getModalMessage(accion: AccionTurno, turno: Turno): string {
    const base = `Donante: ${turno.donor?.full_name ?? '—'} · ${turno.date_local} ${turno.time_local}`;
    if (accion === 'CONFIRMAR') return `${base}\n¿Confirmás este turno?`;
    if (accion === 'CANCELAR') return `${base}\n¿Querés cancelar este turno?`;
    if (accion === 'COMPLETAR') return `${base}\n¿Marcás asistencia?`;
    if (accion === 'NO_PRESENTADO') return `${base}\n¿No se presentó?`;
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