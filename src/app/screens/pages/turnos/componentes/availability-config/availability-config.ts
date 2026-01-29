import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Weekday, AvailabilityDay, TimeSlot } from '../../../../../models/disponibilidad';

type Row = {
  day: Weekday;
  enabled: boolean;
  timeSlots: TimeSlot[];

  rangeStart: string;
  rangeEnd: string;
  interval: number;
  defaultCap: number;

  error?: string | null;
};

@Component({
  selector: 'app-availability-config',
  standalone: false,
  templateUrl: './availability-config.html',
  styleUrl: './availability-config.scss',
})
export class AvailabilityConfig implements OnChanges {
  @Input() hospitalId!: number | string;
  @Input() initial: AvailabilityDay[] | null = null;

  @Output() save = new EventEmitter<AvailabilityDay[]>();
  @Output() cancel = new EventEmitter<void>();

  // ✅ sin tildes, alineado a tu Weekday nuevo
  days: Weekday[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  intervalOptions = [5, 10, 15, 20, 30, 60];

  rows: Row[] = [];

  // snapshot “último estado confirmado” (initial al abrir / lo guardado)
  private lastInitialSnapshot: AvailabilityDay[] | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial']) {
      this.lastInitialSnapshot = this.cloneAvailability(this.initial);
      this.hydrateFromInitial(this.lastInitialSnapshot);
    }
  }

  private baseRows(): Row[] {
    return this.days.map((d) => ({
      day: d,
      enabled: false,
      timeSlots: [],
      rangeStart: '08:00',
      rangeEnd: '16:00',
      interval: 20,
      defaultCap: 1,
      error: null,
    }));
  }

  private hydrateFromInitial(source: AvailabilityDay[] | null): void {
    const base = this.baseRows();

    if (!source || source.length === 0) {
      this.rows = base;
      return;
    }

    // day -> { enabled, timeSlots }
    const map = new Map<Weekday, AvailabilityDay>();
    for (const item of source) {
      map.set(item.day, {
        day: item.day,
        enabled: !!item.enabled,
        timeSlots: (item.timeSlots ?? []).map((s: TimeSlot) => ({
          time: this.normalizeTime(s.time),
          capacity: Math.max(1, Math.min(999, Math.floor(Number(s.capacity) || 1))),
        })),
      });
    }

    this.rows = base.map((r) => {
      const found = map.get(r.day);
      const slots = this.sortUnique((found?.timeSlots ?? []) as TimeSlot[]);
      return {
        ...r,
        enabled: found ? !!found.enabled : false,
        timeSlots: slots,
      };
    });

    for (const row of this.rows) {
      if (row.timeSlots.length === 0) continue;

      const mins = row.timeSlots
        .map((s) => this.toMinutes(s.time))
        .filter((x) => x !== null) as number[];
      if (mins.length === 0) continue;

      const minM = Math.min(...mins);
      const maxM = Math.max(...mins);

      row.rangeStart = this.fromMinutes(minM);
      row.rangeEnd = this.fromMinutes(Math.min(23 * 60 + 55, maxM + row.interval));
      row.defaultCap = row.timeSlots[0]?.capacity ?? 1;
    }
  }

  toggleDay(row: Row): void {
    row.enabled = !row.enabled;
    row.error = null;
    // ✅ NO borrar timeSlots al apagar (se guardan aunque enabled=false)
  }

  addTimeSlot(row: Row): void {
    const cap = Math.max(1, row.defaultCap || 1);
    row.timeSlots = [...row.timeSlots, { time: '', capacity: cap }];
  }

  clearTimeSlots(row: Row): void {
    row.timeSlots = [];
    row.error = null;
  }

  removeTimeSlot(row: Row, idx: number): void {
    row.timeSlots = row.timeSlots.filter((_, i) => i !== idx);
    row.error = null;
  }

  updateTime(row: Row, idx: number, value: string): void {
    const vRaw = (value || '').slice(0, 5);
    const v = this.normalizeTime(vRaw);
    const prev = this.normalizeTime(row.timeSlots?.[idx]?.time || '');

    if (!vRaw) {
      row.timeSlots = row.timeSlots.map((s, i) => (i === idx ? { ...s, time: '' } : s));
      return;
    }

    if (v.length !== 5) return;

    if (v !== prev && this.hasTime(row, v, idx)) {
      this.showRowError(row, `Ese horario (${v}) ya existe para ${row.day}.`);
      row.timeSlots = row.timeSlots.map((s, i) => (i === idx ? { ...s, time: prev } : s));
      return;
    }

    row.timeSlots = row.timeSlots.map((s, i) => (i === idx ? { ...s, time: v } : s));
    row.timeSlots = this.sortKeepEmpties(row.timeSlots);
  }

  updateCapacity(row: Row, idx: number, value: string): void {
    const n = Number(value);
    const cap = Number.isFinite(n) ? Math.max(1, Math.min(999, Math.floor(n))) : 1;

    row.timeSlots = row.timeSlots.map((s, i) => (i === idx ? { ...s, capacity: cap } : s));
  }

  updateDefaultCap(row: Row, value: string): void {
    const n = Number(value);
    row.defaultCap = Number.isFinite(n) ? Math.max(1, Math.min(999, Math.floor(n))) : 1;
  }

  generateFromRange(row: Row): void {
    const startM = this.toMinutes(row.rangeStart);
    const endM = this.toMinutes(row.rangeEnd);
    const step = Number(row.interval);

    if (startM === null || endM === null) return;
    if (!Number.isFinite(step) || step <= 0) return;
    if (endM <= startM) return;

    const cap = Math.max(1, row.defaultCap || 1);

    const generated: TimeSlot[] = [];
    for (let m = startM; m < endM; m += step) {
      generated.push({ time: this.fromMinutes(m), capacity: cap });
    }

    const merged = [...row.timeSlots, ...generated];
    row.timeSlots = this.sortKeepEmpties(merged);

    const dup = this.findDuplicateTime(merged);
    if (dup) this.showRowError(row, `Ya existía ${dup} en ${row.day}. Se evitó duplicar.`);
  }

  dismissError(row: Row): void {
    row.error = null;
  }

  onCancel(): void {
    this.hydrateFromInitial(this.lastInitialSnapshot);
    this.cancel.emit();
  }

  onSave(): void {
    // ✅ devolvemos SIEMPRE los 7 días (como acordamos)
    const out: AvailabilityDay[] = this.rows.map((r) => ({
      day: r.day,
      enabled: !!r.enabled,
      timeSlots: this.sortUnique(r.timeSlots ?? [])
        .filter((s) => !!s.time && s.time.length === 5)
        .map((s) => ({
          time: this.normalizeTime(s.time),
          capacity: Math.max(1, Math.min(999, Math.floor(Number(s.capacity) || 1))),
        })),
    }));

    this.lastInitialSnapshot = this.cloneAvailability(out);
    this.save.emit(out);
  }

  private showRowError(row: Row, msg: string): void {
    row.error = msg;
    window.setTimeout(() => {
      if (row.error === msg) row.error = null;
    }, 2800);
  }

  private hasTime(row: Row, hhmm: string, ignoreIdx?: number): boolean {
    const target = this.normalizeTime(hhmm);
    return (row.timeSlots ?? []).some((s, i) => {
      if (ignoreIdx !== undefined && i === ignoreIdx) return false;
      return this.normalizeTime(s.time) === target && target.length === 5;
    });
  }

  private findDuplicateTime(list: TimeSlot[]): string | null {
    const seen = new Set<string>();
    for (const s of list ?? []) {
      const t = this.normalizeTime(s?.time || '');
      if (!t || t.length !== 5) continue;
      if (seen.has(t)) return t;
      seen.add(t);
    }
    return null;
  }

  private sortUnique(list: TimeSlot[]): TimeSlot[] {
    const seen = new Set<string>();
    const out: TimeSlot[] = [];

    for (const item of list ?? []) {
      const time = this.normalizeTime(item?.time || '');
      if (!time || time.length !== 5) continue;
      if (seen.has(time)) continue;
      seen.add(time);

      const cap = Math.max(1, Math.min(999, Math.floor(Number(item?.capacity) || 1)));
      out.push({ time, capacity: cap });
    }

    out.sort((a, b) => a.time.localeCompare(b.time));
    return out;
  }

  private sortKeepEmpties(list: TimeSlot[]): TimeSlot[] {
    const valids = this.sortUnique(list);
    const empties = (list ?? [])
      .filter((s) => !s?.time || (s.time || '').length < 5)
      .map((s) => ({
        time: '',
        capacity: Math.max(1, Math.min(999, Math.floor(Number(s?.capacity) || 1))),
      }));
    return [...valids, ...empties];
  }

  private cloneAvailability(src: AvailabilityDay[] | null): AvailabilityDay[] | null {
    if (!src) return null;
    return src.map((d) => ({
      day: d.day,
      enabled: !!d.enabled,
      timeSlots: (d.timeSlots ?? []).map((s: TimeSlot) => ({
        time: this.normalizeTime(s.time),
        capacity: Math.max(1, Math.min(999, Math.floor(Number(s.capacity) || 1))),
      })),
    }));
  }

  private normalizeTime(t: string): string {
    if (!t) return t;
    const s = t.slice(0, 5);
    const [hhS, mmS] = s.split(':');
    const hh = Number(hhS);
    const mm = Number(mmS);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return s;
    const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad2(hh)}:${pad2(mm)}`;
  }

  private toMinutes(hhmm: string): number | null {
    if (!hhmm || hhmm.length < 4) return null;
    const [hhS, mmS] = hhmm.split(':');
    const hh = Number(hhS);
    const mm = Number(mmS);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
  }

  private fromMinutes(m: number): string {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad2(hh)}:${pad2(mm)}`;
  }
}
