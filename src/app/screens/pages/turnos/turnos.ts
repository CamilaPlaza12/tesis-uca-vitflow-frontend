import { Component } from '@angular/core';
import { Turno } from '../../../models/turno';

const MIN_CANCEL_MINUTES = 30;
const MAX_ACTION_WINDOW_HOURS = 24;

@Component({
  selector: 'app-turnos',
  standalone: false,
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class Turnos {
  today = new Date();

  turnos: Turno[] = this.buildMockTurnos();

  turnoSeleccionado: Turno | null = null;

  onSelectTurno(turno: Turno): void {
    this.turnoSeleccionado = turno;
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
    const t2 = this.buildTurnoFromNow('t-2', 'PED-2002', 'María López', 'PLAQUETAS', 'CONFIRMADO', 30);
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

  private getTurnoDateTime(turno: Turno): Date {
    return new Date(`${turno.fecha}T${turno.hora}`);
  }

  private minutesUntilTurno(turno: Turno): number {
    const now = new Date().getTime();
    const turnoTime = this.getTurnoDateTime(turno).getTime();
    return Math.floor((turnoTime - now) / 60000);
  }

  private withinActionWindow(turno: Turno): boolean {
    const now = new Date().getTime();
    const turnoTime = this.getTurnoDateTime(turno).getTime();
    const max = turnoTime + MAX_ACTION_WINDOW_HOURS * 3600000;
    return now >= turnoTime && now <= max;
  }

  canConfirm(turno: Turno): boolean {
    return turno.estado === 'PROGRAMADO' && this.minutesUntilTurno(turno) > 0;
  }

  canReprogram(turno: Turno): boolean {
    if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.estado)) return false;
    return this.minutesUntilTurno(turno) >= MIN_CANCEL_MINUTES;
  }

  canCancel(turno: Turno): boolean {
    if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.estado)) return false;
    return this.minutesUntilTurno(turno) >= MIN_CANCEL_MINUTES;
  }

  canMarkCompleted(turno: Turno): boolean {
    if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.estado)) return false;
    return this.withinActionWindow(turno);
  }

  canMarkNoShow(turno: Turno): boolean {
    if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.estado)) return false;
    return this.withinActionWindow(turno);
  }

  confirmarTurno(turno: Turno): void {
    turno.estado = 'CONFIRMADO';
  }

  marcarAsistencia(turno: Turno): void {
    turno.estado = 'COMPLETADO';
  }

  marcarNoPresentado(turno: Turno): void {
    turno.estado = 'NO_PRESENTADO';
  }

  cancelarTurno(turno: Turno): void {
    turno.estado = 'CANCELADO';
  }
}
