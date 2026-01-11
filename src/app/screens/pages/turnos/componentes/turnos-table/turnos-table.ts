import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turno, DonationType, AppointmentStatus } from '../../../../../models/turno';

type TipoFiltro = 'TODOS' | DonationType;

@Component({
  selector: 'app-turnos-table',
  standalone: false,
  templateUrl: './turnos-table.html',
  styleUrl: './turnos-table.scss',
})
export class TurnosTable {
  @Input() turnos: Turno[] = [];
  @Input() turnoSeleccionadoId: string | null = null;

  @Output() selectTurno = new EventEmitter<Turno>();

  desde = '';
  hasta = '';
  donante = '';
  tipo: TipoFiltro = 'TODOS';

  onRowClick(turno: Turno): void {
    this.selectTurno.emit(turno);
  }

  clear(): void {
    this.desde = '';
    this.hasta = '';
    this.donante = '';
    this.tipo = 'TODOS';
  }

  tipoHuman(t: DonationType): string {
    if (t === 'SANGRE') return 'Sangre';
    if (t === 'PLAQUETAS') return 'Plaquetas';
    return 'Médula';
  }

  estadoHuman(s: AppointmentStatus): string {
    if (s === 'PROGRAMADO') return 'Programado';
    if (s === 'CONFIRMADO') return 'Confirmado';
    if (s === 'COMPLETADO') return 'Completado';
    if (s === 'NO_PRESENTADO') return 'No presentado';
    return 'Cancelado';
  }

  private turnoDateTime(t: Turno): number {
    return new Date(`${t.fecha}T${t.hora}:00`).getTime();
  }

  private inRange(fecha: string): boolean {
    const d = this.desde.trim();
    const h = this.hasta.trim();

    if (d && fecha < d) return false;
    if (h && fecha > h) return false;

    return true;
  }

  get turnosProcesados(): Turno[] {
    const qDon = this.donante.trim().toLowerCase();

    const filtered = this.turnos.filter(t => {
      const okRango = this.inRange(t.fecha);
      const okDon = !qDon || (t.nombreDonante || '').toLowerCase().includes(qDon);
      const okTipo = this.tipo === 'TODOS' || t.tipoDonacion === this.tipo;
      return okRango && okDon && okTipo;
    });

    const now = Date.now();
    const upcoming: Turno[] = [];
    const past: Turno[] = [];

    for (const t of filtered) {
      const tt = this.turnoDateTime(t);
      if (tt >= now) upcoming.push(t);
      else past.push(t);
    }

    upcoming.sort((a, b) => this.turnoDateTime(a) - this.turnoDateTime(b));
    past.sort((a, b) => this.turnoDateTime(b) - this.turnoDateTime(a));

    return [...past, ...upcoming];
  }
}
