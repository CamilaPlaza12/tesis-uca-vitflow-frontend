import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DiaSemana, DisponibilidadDia, HorarioCapacidad } from './../../../../../models/disponibilidad';

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-availability-editor-modal',
  standalone: false,
  templateUrl: './availability-editor-modal.html',
  styleUrl: './availability-editor-modal.scss',
})
export class AvailabilityEditorModal {
  @Input() open = false;
  @Input() hospitalId: number | string = 0;
  @Input() initial: DisponibilidadDia[] | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<DisponibilidadDia[]>();

  dias = DIAS;
  selectedDay: DiaSemana = 'Lunes';

  local: DisponibilidadDia[] = [];
  error: string | null = null;

  ngOnChanges(): void {
    if (!this.open) return;

    this.error = null;

    const base = (this.initial ?? []).map(d => ({
      id_hospital: d.id_hospital,
      dia: d.dia,
      horarios: (d.horarios ?? []).map(h => ({ hora: h.hora, capacidad: h.capacidad })),
    }));

    this.local = base;
    if (!this.local.find(x => x.dia === this.selectedDay)) {
      this.selectedDay = 'Lunes';
    }
  }

  isDayEnabled(day: DiaSemana): boolean {
    return this.local.some(d => d.dia === day);
  }

  toggleDay(day: DiaSemana): void {
    const idx = this.local.findIndex(d => d.dia === day);
    if (idx >= 0) {
      this.local.splice(idx, 1);
      if (this.selectedDay === day) {
        const next = this.local[0]?.dia ?? 'Lunes';
        this.selectedDay = next;
      }
      return;
    }

    this.local.push({ id_hospital: this.hospitalId, dia: day, horarios: [] });
    this.selectedDay = day;
  }

  selectDay(day: DiaSemana): void {
    this.selectedDay = day;
  }

  get currentDay(): DisponibilidadDia | null {
    return this.local.find(d => d.dia === this.selectedDay) ?? null;
  }

  addSlot(): void {
    const day = this.currentDay;
    if (!day) return;
    day.horarios.push({ hora: '', capacidad: 1 });
  }

  removeSlot(i: number): void {
    const day = this.currentDay;
    if (!day) return;
    day.horarios.splice(i, 1);
  }

  normalizeTime(t: string): string {
    return (t || '').trim();
  }

  validate(): boolean {
    this.error = null;

    if (this.local.length === 0) {
      this.error = 'Seleccioná al menos un día para habilitar turnos.';
      return false;
    }

    for (const d of this.local) {
      const seen = new Set<string>();

      for (const h of d.horarios) {
        h.hora = this.normalizeTime(h.hora);

        if (!h.hora) {
          this.error = `En ${d.dia}: completá la hora en todos los horarios.`;
          return false;
        }

        if (!Number.isFinite(h.capacidad) || h.capacidad < 1) {
          this.error = `En ${d.dia}: la capacidad debe ser 1 o más.`;
          return false;
        }

        const key = h.hora;
        if (seen.has(key)) {
          this.error = `En ${d.dia}: no podés repetir la misma hora (${h.hora}).`;
          return false;
        }
        seen.add(key);
      }
    }

    return true;
  }

  onSave(): void {
    if (!this.validate()) return;

    const cleaned: DisponibilidadDia[] = this.local
      .map(d => ({
        id_hospital: this.hospitalId,
        dia: d.dia,
        horarios: (d.horarios ?? [])
          .map(h => ({ hora: this.normalizeTime(h.hora), capacidad: Number(h.capacidad) }))
          .sort((a, b) => a.hora.localeCompare(b.hora)),
      }))
      .sort((a, b) => this.dias.indexOf(a.dia) - this.dias.indexOf(b.dia));

    this.save.emit(cleaned);
  }

  trackSlot(_: number, s: HorarioCapacidad): string {
    return `${s.hora}-${s.capacidad}`;
  }
}
