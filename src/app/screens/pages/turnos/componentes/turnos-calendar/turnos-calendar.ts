import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turno } from '../../../../../models/turno';

@Component({
  selector: 'app-turnos-calendar',
  standalone: false,
  templateUrl: './turnos-calendar.html',
  styleUrl: './turnos-calendar.scss',
})
export class TurnosCalendar {
  @Input() turnos: Turno[] = [];
  @Input() selectedDate!: Date;

  @Output() selectTurno = new EventEmitter<Turno>();

  hours: string[] = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}:00` : `${i}:00`
  );

  get dateKey(): string {
    return this.toDateStr(this.selectedDate);
  }

  turnosDelDia(): Turno[] {
    return this.turnos.filter(t => t.fecha === this.dateKey);
  }

  turnosPorHora(hour: string): Turno[] {
    return this.turnosDelDia().filter(t => t.hora.startsWith(hour.slice(0, 2)));
  }

  onSelect(turno: Turno): void {
    this.selectTurno.emit(turno);
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
  }
}
