import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DiaSemana, DisponibilidadDia, HorarioCapacidad } from '../../../../../models/disponibilidad';

type Row = {
  dia: DiaSemana;
  enabled: boolean;
  horarios: HorarioCapacidad[];

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
  @Input() initial: DisponibilidadDia[] | null = null;

  @Output() save = new EventEmitter<DisponibilidadDia[]>();
  @Output() cancel = new EventEmitter<void>();

  dias: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  intervalOptions = [5, 10, 15, 20, 30, 60];

  rows: Row[] = [];

  // snapshot “último estado confirmado” (initial al abrir / lo guardado)
  private lastInitialSnapshot: DisponibilidadDia[] | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial']) {
      this.lastInitialSnapshot = this.cloneDisponibilidad(this.initial);
      this.hydrateFromInitial(this.lastInitialSnapshot);
    }
  }

  private baseRows(): Row[] {
    return this.dias.map((d) => ({
      dia: d,
      enabled: false,
      horarios: [],
      rangeStart: '08:00',
      rangeEnd: '16:00',
      interval: 20,
      defaultCap: 1,
      error: null,
    }));
  }

  private hydrateFromInitial(source: DisponibilidadDia[] | null): void {
    const base = this.baseRows();

    if (!source || source.length === 0) {
      this.rows = base;
      return;
    }

    const map = new Map<DiaSemana, HorarioCapacidad[]>();
    for (const item of source) {
      map.set(
        item.dia,
        (item.horarios ?? []).map((h) => ({
          ...h,
          hora: this.normalizeTime(h.hora),
          capacidad: Math.max(1, Math.min(999, Math.floor(Number(h.capacidad) || 1))),
        }))
      );
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
    row.error = null;
    if (!row.enabled) row.horarios = [];
  }

  addHorario(row: Row): void {
    if (!row.enabled) return;
    const cap = Math.max(1, row.defaultCap || 1);
    row.horarios = [...row.horarios, { hora: '', capacidad: cap }];
  }

  clearHorarios(row: Row): void {
    if (!row.enabled) return;
    row.horarios = [];
    row.error = null;
  }

  removeHorario(row: Row, idx: number): void {
    if (!row.enabled) return;
    row.horarios = row.horarios.filter((_, i) => i !== idx);
    row.error = null;
  }

  updateHora(row: Row, idx: number, value: string): void {
    if (!row.enabled) return;

    const vRaw = (value || '').slice(0, 5);
    const v = this.normalizeTime(vRaw);
    const prev = this.normalizeTime(row.horarios?.[idx]?.hora || '');

    if (!vRaw) {
      row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, hora: '' } : h));
      return;
    }

    if (v.length !== 5) return;

    if (v !== prev && this.hasHora(row, v, idx)) {
      this.showRowError(row, `Ese horario (${v}) ya existe para ${row.dia}.`);
      row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, hora: prev } : h));
      return;
    }

    row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, hora: v } : h));
    row.horarios = this.sortKeepEmpties(row.horarios);
  }

  updateCapacidad(row: Row, idx: number, value: string): void {
    if (!row.enabled) return;

    const n = Number(value);
    const cap = Number.isFinite(n) ? Math.max(1, Math.min(999, Math.floor(n))) : 1;

    row.horarios = row.horarios.map((h, i) => (i === idx ? { ...h, capacidad: cap } : h));
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

    const merged = [...row.horarios, ...generated];
    row.horarios = this.sortKeepEmpties(merged);

    const dup = this.findDuplicateHora(merged);
    if (dup) this.showRowError(row, `Ya existía ${dup} en ${row.dia}. Se evitó duplicar.`);
  }

  dismissError(row: Row): void {
    row.error = null;
  }

  onCancel(): void {
    // ✅ descartar cambios: volver al snapshot de “lo que estaba” (initial)
    this.hydrateFromInitial(this.lastInitialSnapshot);
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

    // ✅ lo guardado pasa a ser el nuevo “estado original” para futuros Cancel
    this.lastInitialSnapshot = this.cloneDisponibilidad(out);

    this.save.emit(out);
  }

  private showRowError(row: Row, msg: string): void {
    row.error = msg;
    window.setTimeout(() => {
      if (row.error === msg) row.error = null;
    }, 2800);
  }

  private hasHora(row: Row, hhmm: string, ignoreIdx?: number): boolean {
    const target = this.normalizeTime(hhmm);
    return (row.horarios ?? []).some((h, i) => {
      if (ignoreIdx !== undefined && i === ignoreIdx) return false;
      return this.normalizeTime(h.hora) === target && target.length === 5;
    });
  }

  private findDuplicateHora(list: HorarioCapacidad[]): string | null {
    const seen = new Set<string>();
    for (const h of list ?? []) {
      const t = this.normalizeTime(h?.hora || '');
      if (!t || t.length !== 5) continue;
      if (seen.has(t)) return t;
      seen.add(t);
    }
    return null;
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

  private sortKeepEmpties(list: HorarioCapacidad[]): HorarioCapacidad[] {
    const valids = this.sortUnique(list);
    const empties = (list ?? [])
      .filter((h) => !h?.hora || (h.hora || '').length < 5)
      .map((h) => ({
        hora: '',
        capacidad: Math.max(1, Math.min(999, Math.floor(Number(h?.capacidad) || 1))),
      }));
    return [...valids, ...empties];
  }

  private cloneDisponibilidad(src: DisponibilidadDia[] | null): DisponibilidadDia[] | null {
    if (!src) return null;
    return src.map((d) => ({
      id_hospital: d.id_hospital,
      dia: d.dia,
      horarios: (d.horarios ?? []).map((h) => ({
        hora: this.normalizeTime(h.hora),
        capacidad: Math.max(1, Math.min(999, Math.floor(Number(h.capacidad) || 1))),
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
