import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DiaSemana, DisponibilidadDia, HorarioCapacidad } from '../../../../../models/disponibilidad';

type Row = {
  dia: DiaSemana;
  enabled: boolean;
  horarios: HorarioCapacidad[];

  rangeStart: string; // "HH:mm"
  rangeEnd: string;   // "HH:mm"
  interval: number;   // minutos
  defaultCap: number; // capacidad para los slots generados
};

@Component({
  selector: 'app-availability-config',
  standalone: false,
  templateUrl: './availability-config.html',
  styleUrl: './availability-config.scss',
})
export class AvailabilityConfig implements OnChanges {
  @Input() hospitalId!: number | string;
  @Input() initial: DisponibilidadDia[] | null = null;

  @Output() save = new EventEmitter<DisponibilidadDia[]>();
  @Output() cancel = new EventEmitter<void>();

  dias: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  intervalOptions = [5, 10, 15, 20, 30, 60];

  rows: Row[] = this.dias.map((d) => ({
    dia: d,
    enabled: false,
    horarios: [],
    rangeStart: '08:00',
    rangeEnd: '16:00',
    interval: 20,
    defaultCap: 1,
  }));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial']) this.hydrateFromInitial();
  }

  private hydrateFromInitial(): void {
    const base = this.dias.map((d) => ({
      dia: d,
      enabled: false,
      horarios: [] as HorarioCapacidad[],
      rangeStart: '08:00',
      rangeEnd: '16:00',
      interval: 20,
      defaultCap: 1,
    }));

    if (!this.initial || this.initial.length === 0) {
      this.rows = base;
      return;
    }

    const map = new Map<DiaSemana, HorarioCapacidad[]>();
    for (const item of this.initial) {
      map.set(item.dia, (item.horarios ?? []).map((h) => ({ ...h, hora: this.normalizeTime(h.hora) })));
    }

    this.rows = base.map((r) => ({
      ...r,
      enabled: map.has(r.dia),
      horarios: this.sortUnique(map.get(r.dia) ?? []),
    }));

    for (const row of this.rows) {
      if (!row.enabled || row.horarios.length === 0) continue;
      const mins = row.horarios
        .map((h) => this.toMinutes(h.hora))
        .filter((x) => x !== null) as number[];
      if (mins.length === 0) continue;

      const minM = Math.min(...mins);
      const maxM = Math.max(...mins);
      row.rangeStart = this.fromMinutes(minM);
      row.rangeEnd = this.fromMinutes(Math.min(23 * 60 + 55, maxM + row.interval));
      row.defaultCap = row.horarios[0]?.capacidad ?? 1;
    }
  }

  toggleDay(row: Row): void {
    row.enabled = !row.enabled;
    if (!row.enabled) row.horarios = [];
  }

  addHorario(row: Row): void {
    if (!row.enabled) return;

    const hora = this.normalizeTime('08:00');
    if (this.hasHora(row, hora)) {
      alert(`Ese horario (${hora}) ya existe para ${row.dia}.`);
      return;
    }

    const cap = Math.max(1, row.defaultCap || 1);
    row.horarios = this.sortUnique([...row.horarios, { hora, capacidad: cap }]);
  }

  clearHorarios(row: Row): void {
    if (!row.enabled) return;
    row.horarios = [];
  }

  removeHorario(row: Row, idx: number): void {
    if (!row.enabled) return;
    row.horarios = row.horarios.filter((_, i) => i !== idx);
  }

  updateHora(row: Row, idx: number, value: string): void {
    if (!row.enabled) return;

    const v = this.normalizeTime((value || '').slice(0, 5));
    const prev = this.normalizeTime(row.horarios?.[idx]?.hora || '');

    if (!v || v.length !== 5) return;

    if (v !== prev && this.hasHora(row, v)) {
      alert(`Ese horario (${v}) ya existe para ${row.dia}.`);
      row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, hora: prev } : h));
      return;
    }

    row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, hora: v } : h));
    row.horarios = this.sortUnique(row.horarios);
  }

  updateCapacidad(row: Row, idx: number, value: string): void {
    if (!row.enabled) return;

    const n = Number(value);
    const cap = Number.isFinite(n) ? Math.max(1, Math.min(999, Math.floor(n))) : 1;

    row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, capacidad: cap } : h));
    row.horarios = this.sortUnique(row.horarios);
  }

  updateDefaultCap(row: Row, value: string): void {
    const n = Number(value);
    row.defaultCap = Number.isFinite(n) ? Math.max(1, Math.min(999, Math.floor(n))) : 1;
  }

  generateFromRange(row: Row): void {
    if (!row.enabled) return;

    const startM = this.toMinutes(row.rangeStart);
    const endM = this.toMinutes(row.rangeEnd);
    const step = Number(row.interval);

    if (startM === null || endM === null) return;
    if (!Number.isFinite(step) || step <= 0) return;
    if (endM <= startM) return;

    const cap = Math.max(1, row.defaultCap || 1);

    const generated: HorarioCapacidad[] = [];
    for (let m = startM; m < endM; m += step) {
      generated.push({ hora: this.fromMinutes(m), capacidad: cap });
    }

    // Merge sin duplicar: si ya existe la hora, NO la agrega
    const merged = [...row.horarios.map(h => ({ ...h, hora: this.normalizeTime(h.hora) })), ...generated];

    row.horarios = this.sortUnique(merged);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    const out: DisponibilidadDia[] = this.rows
      .filter((r) => r.enabled)
      .map((r) => ({
        id_hospital: this.hospitalId,
        dia: r.dia,
        horarios: this.sortUnique(r.horarios ?? [])
          .filter((h) => !!h.hora && h.hora.length === 5)
          .map((h) => ({
            hora: this.normalizeTime(h.hora),
            capacidad: Math.max(1, Math.min(999, Math.floor(Number(h.capacidad) || 1))),
          })),
      }))
      .filter((d) => d.horarios.length > 0);

    this.save.emit(out);
  }

  private hasHora(row: Row, hhmm: string): boolean {
    const target = this.normalizeTime(hhmm);
    return (row.horarios ?? []).some((h) => this.normalizeTime(h.hora) === target);
  }

  private sortUnique(list: HorarioCapacidad[]): HorarioCapacidad[] {
    const seen = new Set<string>();
    const out: HorarioCapacidad[] = [];

    for (const item of list ?? []) {
      const hora = this.normalizeTime(item?.hora || '');
      if (!hora || hora.length !== 5) continue;
      if (seen.has(hora)) continue;
      seen.add(hora);

      const cap = Math.max(1, Math.min(999, Math.floor(Number(item?.capacidad) || 1)));
      out.push({ hora, capacidad: cap });
    }

    out.sort((a, b) => a.hora.localeCompare(b.hora));
    return out;
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
