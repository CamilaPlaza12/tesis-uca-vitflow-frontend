import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turno, DonationType, AppointmentStatus } from '../../../../../models/turno';

type TipoFiltro = 'TODOS' | DonationType;
type EstadoFiltro = 'TODOS' | AppointmentStatus;

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

  tipoSeleccionado: TipoFiltro = 'TODOS';
  estadoSeleccionado: EstadoFiltro = 'TODOS';

  estadoOpen = false;

  onRowClick(turno: Turno): void {
    this.selectTurno.emit(turno);
  }

  toggleEstado(): void {
    this.estadoOpen = !this.estadoOpen;
  }

  closeEstado(): void {
    this.estadoOpen = false;
  }

  setEstado(e: EstadoFiltro): void {
    this.estadoSeleccionado = e;
    this.estadoOpen = false;
  }

  setTipo(t: TipoFiltro): void {
    this.tipoSeleccionado = t;
  }

  get estadoLabel(): string {
    if (this.estadoSeleccionado === 'TODOS') return 'Todos los estados';
    return this.estadoHuman(this.estadoSeleccionado);
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

  get turnosFiltrados(): Turno[] {
    return this.turnos.filter(t => {
      const okTipo = this.tipoSeleccionado === 'TODOS' || t.tipoDonacion === this.tipoSeleccionado;
      const okEstado = this.estadoSeleccionado === 'TODOS' || t.estado === this.estadoSeleccionado;
      return okTipo && okEstado;
    });
  }
}
