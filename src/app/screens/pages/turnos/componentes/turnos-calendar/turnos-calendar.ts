import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Turno } from '../../../../../models/turno';

type ViewMode = 'DAY' | 'WEEK' | 'MONTH';

type MonthCell = {
  date: Date;
  inCurrentMonth: boolean;
  key: string; // yyyy-mm-dd
  label: number; // day number
};


@Component({
  selector: 'app-turnos-calendar',
  standalone: false,
  templateUrl: './turnos-calendar.html',
  styleUrl: './turnos-calendar.scss',
})
export class TurnosCalendar implements OnChanges {
  @Input() turnos: Turno[] = [];
  @Input() selectedDate!: Date; // se usa como “fecha inicial”

  @Output() selectTurno = new EventEmitter<Turno>();

  view: ViewMode = 'DAY';
  activeDate = new Date();

  hours: string[] = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}:00` : `${i}:00`));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.activeDate = new Date(this.selectedDate);
    }
  }

  setView(v: ViewMode): void {
    this.view = v;
  }

  goToday(): void {
    this.activeDate = new Date();
  }

  prev(): void {
    if (this.view === 'DAY') this.activeDate = this.addDays(this.activeDate, -1);
    if (this.view === 'WEEK') this.activeDate = this.addDays(this.activeDate, -7);
    if (this.view === 'MONTH') this.activeDate = this.addMonths(this.activeDate, -1);
  }

  next(): void {
    if (this.view === 'DAY') this.activeDate = this.addDays(this.activeDate, 1);
    if (this.view === 'WEEK') this.activeDate = this.addDays(this.activeDate, 7);
    if (this.view === 'MONTH') this.activeDate = this.addMonths(this.activeDate, 1);
  }

  onSelect(turno: Turno): void {
    this.selectTurno.emit(turno);
  }

  // ---------- DAY ----------

    get todayKey(): string {
    return this.toDateStr(new Date());
  }

  get activeKey(): string {
    return this.toDateStr(this.activeDate);
  }

  turnosDelDia(key: string = this.activeKey): Turno[] {
    return this.turnos
      .filter(t => t.fecha === key)
      .slice()
      .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
  }

  turnosPorHora(hour: string): Turno[] {
    const hh = hour.slice(0, 2);
    return this.turnosDelDia().filter(t => (t.hora || '').startsWith(hh));
  }

  // ---------- WEEK (LUN-DOM) ----------

  get weekDays(): Date[] {
    const start = this.startOfWeekMonday(this.activeDate);
    return Array.from({ length: 7 }, (_, i) => this.addDays(start, i));
  }

  weekLabel(): string {
    const start = this.weekDays[0];
    const end = this.weekDays[6];
    return `${this.pad2(start.getDate())}/${this.pad2(start.getMonth() + 1)} – ${this.pad2(end.getDate())}/${this.pad2(end.getMonth() + 1)}`;
  }

  turnosDeFecha(d: Date): Turno[] {
    return this.turnosDelDia(this.toDateStr(d));
  }

  // ---------- MONTH ----------

  get monthTitle(): string {
    // sin “Intl” raro: usamos pipe en HTML, acá solo devolvemos Date
    return '';
  }

  get monthCells(): MonthCell[] {
    const y = this.activeDate.getFullYear();
    const m = this.activeDate.getMonth();

    const firstOfMonth = new Date(y, m, 1);
    const start = this.startOfWeekMonday(firstOfMonth);

    const cells: MonthCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = this.addDays(start, i);
      const key = this.toDateStr(d);
      cells.push({
        date: d,
        inCurrentMonth: d.getMonth() === m,
        key,
        label: d.getDate(),
      });
    }
    return cells;
  }

  countTurnos(key: string): number {
    return this.turnos.filter(t => t.fecha === key).length;
  }

  previewTurnos(key: string, max: number): Turno[] {
    return this.turnosDelDia(key).slice(0, max);
  }

  openDayFromMonth(d: Date): void {
    this.activeDate = new Date(d);
    this.view = 'DAY';
  }

  // ---------- Utils ----------

  private startOfWeekMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay(); // 0 Dom ... 6 Sab
    const diff = day === 0 ? -6 : 1 - day; // lunes como inicio
    return this.addDays(date, diff);
  }

  private addDays(d: Date, days: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return out;
  }

  private addMonths(d: Date, months: number): Date {
    const out = new Date(d);
    out.setMonth(out.getMonth() + months);
    return out;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
  }
}
