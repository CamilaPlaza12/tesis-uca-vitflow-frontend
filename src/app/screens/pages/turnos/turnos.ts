import { Component, ElementRef, ViewChild } from '@angular/core';
import { Turno } from '../../../models/turno';
import { AccionTurno } from './turno-actions.policy';
import { DisponibilidadDia } from '../../../models/disponibilidad';

@Component({
  selector: 'app-turnos',
  standalone: false,
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class Turnos {
  today = new Date();

  hospitalId: number | string = 123;

  disponibilidad: DisponibilidadDia[] | null = this.buildMockDisponibilidad();

  availabilityConfigOpen = false;
  availabilityConfigClosing = false;

  private readonly configAnimMs = 220;

  turnos: Turno[] = this.buildMockTurnos();
  turnoSeleccionado: Turno | null = null;

  modalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Confirmar';
  modalLoading = false;
  modalError: string | null = null;

  private accionPendiente: AccionTurno | null = null;

  @ViewChild('availabilityAnchor') availabilityAnchor?: ElementRef<HTMLElement>;
  @ViewChild('topAnchor') topAnchor?: ElementRef<HTMLElement>;

  get hasDisponibilidad(): boolean {
    return !!this.disponibilidad && this.disponibilidad.length > 0;
  }

  onClickConfigurar(): void {
    this.availabilityConfigClosing = false;
    this.availabilityConfigOpen = true;
    this.afterDom(() => this.scrollToAvailability());
  }

  onCancelConfigurar(): void {
    this.closeAvailabilityConfig(true);
  }

  onSaveDisponibilidad(data: DisponibilidadDia[]): void {
    this.disponibilidad = data;
    this.closeAvailabilityConfig(true);
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

      // ✅ si al cerrar colapsa altura, a veces el scroll queda “pasado”.
      // clamp al máximo scroll posible del contenedor real.
      const scroller = this.getScrollParent(this.topAnchor?.nativeElement || document.body);
      if (scroller) {
        const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        if (scroller.scrollTop > max) scroller.scrollTop = max;
      }

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

    this.modalError = null;
    this.modalLoading = true;

    try {
      await this.executeAccion(this.accionPendiente, this.turnoSeleccionado);
      this.modalOpen = false;
      this.accionPendiente = null;
    } catch (e) {
      this.modalError = this.getErrorMessage(e);
    } finally {
      this.modalLoading = false;
    }
  }

  // -------------------------
  // SCROLL (sin tocar App)
  // -------------------------

  private scrollToAvailability(): void {
    const el = this.availabilityAnchor?.nativeElement;
    if (!el) return;
    this.scrollToElementWithOffset(el, 14);
  }

  private scrollToTop(): void {
    const el = this.topAnchor?.nativeElement;
    if (el) {
      this.scrollToElementWithOffset(el, 14);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private scrollToElementWithOffset(target: HTMLElement, offset = 12): void {
    const scroller = this.getScrollParent(target);

    // ✅ offset dinámico: si hay algo sticky/fijo arriba, esto evita que “se coma” el título
    const safeOffset = Math.max(0, offset);

    if (!scroller) {
      const topWin = target.getBoundingClientRect().top + window.scrollY - safeOffset;
      window.scrollTo({ top: Math.max(0, topWin), behavior: 'smooth' });
      return;
    }

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const top = (targetRect.top - scrollerRect.top) + scroller.scrollTop - safeOffset;
    scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  private getScrollParent(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null;

    let parent: HTMLElement | null = el.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight;

      if (canScroll) return parent;
      parent = parent.parentElement;
    }

    // fallback: si nadie scrollea, es el window
    return null;
  }

  private afterDom(fn: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  // -------------------------
  // RESTO: tu lógica normal
  // -------------------------

  private async executeAccion(accion: AccionTurno, turno: Turno): Promise<void> {
    if (accion === 'REPROGRAMAR') {
      throw new Error('Reprogramar todavía no está implementado en el mock.');
    }

    if (accion === 'CONFIRMAR') turno.estado = 'CONFIRMADO';
    if (accion === 'CANCELAR') turno.estado = 'CANCELADO';
    if (accion === 'COMPLETAR') turno.estado = 'COMPLETADO';
    if (accion === 'NO_PRESENTADO') turno.estado = 'NO_PRESENTADO';
  }

  private getErrorMessage(e: unknown): string {
    if (e instanceof Error && e.message) return e.message;
    if (typeof e === 'string') return e;
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
    if (accion === 'CANCELAR') return 'Cancelar turno';
    if (accion === 'COMPLETAR') return 'Marcar como completado';
    if (accion === 'NO_PRESENTADO') return 'Marcar no presentado';
    if (accion === 'CONFIRMAR') return 'Confirmar';
    return 'Reprogramar';
  }

  private getModalMessage(accion: AccionTurno, turno: Turno): string {
    const base = `Donante: ${turno.nombreDonante} · ${turno.fecha} ${turno.hora} · Pedido #${turno.pedidoId}`;
    if (accion === 'CONFIRMAR') return `${base}\n¿Confirmás este turno?`;
    if (accion === 'CANCELAR') return `${base}\n¿Querés cancelar este turno?`;
    if (accion === 'COMPLETAR') return `${base}\n¿Marcás asistencia y lo pasás a completado?`;
    if (accion === 'NO_PRESENTADO') return `${base}\n¿Confirmás que el donante no se presentó?`;
    return `${base}\n¿Querés reprogramar este turno?`;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
  }

  private toTimeStr(d: Date): string {
    return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
  }

  private addMinutes(d: Date, minutes: number): Date {
    return new Date(d.getTime() + minutes * 60000);
  }

  private addHours(d: Date, hours: number): Date {
    return new Date(d.getTime() + hours * 3600000);
  }

  private addDays(d: Date, days: number): Date {
    return new Date(d.getTime() + days * 86400000);
  }

  private buildTurnoFromNow(
    id: string,
    pedidoId: string,
    nombreDonante: string,
    tipoDonacion: Turno['tipoDonacion'],
    estado: Turno['estado'],
    offsetMinutesFromNow: number
  ): Turno {
    const dt = this.addMinutes(new Date(), offsetMinutesFromNow);
    return {
      id,
      pedidoId,
      nombreDonante,
      tipoDonacion,
      fecha: this.toDateStr(dt),
      hora: this.toTimeStr(dt),
      estado,
    };
  }

  private buildTurnoOnDateTime(
    id: string,
    pedidoId: string,
    nombreDonante: string,
    tipoDonacion: Turno['tipoDonacion'],
    estado: Turno['estado'],
    dt: Date
  ): Turno {
    return {
      id,
      pedidoId,
      nombreDonante,
      tipoDonacion,
      fecha: this.toDateStr(dt),
      hora: this.toTimeStr(dt),
      estado,
    };
  }

  private buildMockTurnos(): Turno[] {
    const now = new Date();

    const t1 = this.buildTurnoFromNow('t-1', 'PED-2001', 'Juan Pérez', 'SANGRE', 'PROGRAMADO', 0);
    const t2 = this.buildTurnoFromNow('t-2', 'PED-2002', 'María López', 'PLAQUETAS', 'CONFIRMADO', 35);
    const t3 = this.buildTurnoFromNow('t-3', 'PED-2003', 'Sofi Gómez', 'MEDULA_OSEA', 'PROGRAMADO', 35);
    const t4 = this.buildTurnoFromNow('t-4', 'PED-2004', 'Ana Suárez', 'SANGRE', 'CONFIRMADO', 20);
    const t5 = this.buildTurnoFromNow('t-5', 'PED-2005', 'Carlos Díaz', 'PLAQUETAS', 'PROGRAMADO', 29);

    const t6 = this.buildTurnoFromNow('t-6', 'PED-2006', 'Lucía Martínez', 'SANGRE', 'CONFIRMADO', -10);
    const t7 = this.buildTurnoFromNow('t-7', 'PED-2007', 'Pedro Fernández', 'PLAQUETAS', 'PROGRAMADO', -120);
    const t8 = this.buildTurnoFromNow('t-8', 'PED-2008', '—', 'MEDULA_OSEA', 'CONFIRMADO', -600);

    const t9 = this.buildTurnoFromNow('t-9', 'PED-2009', 'Valentina Ruiz', 'SANGRE', 'PROGRAMADO', -1500);
    const t10 = this.buildTurnoFromNow('t-10', 'PED-2010', 'Martín López', 'PLAQUETAS', 'CONFIRMADO', -2000);

    const t11 = this.buildTurnoOnDateTime(
      't-11',
      'PED-2011',
      'Camila Álvarez',
      'SANGRE',
      'CANCELADO',
      this.addHours(this.addDays(now, 1), 3)
    );

    const t12 = this.buildTurnoOnDateTime(
      't-12',
      'PED-2012',
      'Nicolás Romero',
      'PLAQUETAS',
      'COMPLETADO',
      this.addHours(this.addDays(now, -1), 2)
    );

    const t13 = this.buildTurnoOnDateTime(
      't-13',
      'PED-2013',
      'Florencia Paz',
      'MEDULA_OSEA',
      'NO_PRESENTADO',
      this.addHours(this.addDays(now, -2), 1)
    );

    const t14 = this.buildTurnoOnDateTime(
      't-14',
      'PED-2014',
      'Julieta Torres',
      'SANGRE',
      'PROGRAMADO',
      this.addMinutes(now, 31)
    );

    const t15 = this.buildTurnoOnDateTime(
      't-15',
      'PED-2015',
      'Diego Sánchez',
      'PLAQUETAS',
      'CONFIRMADO',
      this.addMinutes(now, 30)
    );

    return [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15];
  }

  private buildMockDisponibilidad(): DisponibilidadDia[] {
    const id = this.hospitalId;

    return [
      {
        id_hospital: id,
        dia: 'Lunes',
        horarios: [
          { hora: '08:00', capacidad: 3 },
          { hora: '08:20', capacidad: 3 },
          { hora: '08:40', capacidad: 3 },
          { hora: '09:00', capacidad: 3 },
          { hora: '09:20', capacidad: 3 },
          { hora: '09:40', capacidad: 3 },
          { hora: '10:00', capacidad: 2 },
        ],
      },
      {
        id_hospital: id,
        dia: 'Miércoles',
        horarios: [
          { hora: '14:00', capacidad: 2 },
          { hora: '14:30', capacidad: 2 },
          { hora: '15:00', capacidad: 2 },
          { hora: '15:30', capacidad: 2 },
          { hora: '16:00', capacidad: 2 },
        ],
      },
      {
        id_hospital: id,
        dia: 'Viernes',
        horarios: [
          { hora: '09:00', capacidad: 4 },
          { hora: '09:15', capacidad: 4 },
          { hora: '09:30', capacidad: 4 },
          { hora: '09:45', capacidad: 4 },
          { hora: '10:00', capacidad: 4 },
        ],
      },
    ];
  }
}
