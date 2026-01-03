import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Turno, DonationType, AppointmentStatus } from '../../../../../models/turno';

type PopoverKey = 'FECHA' | 'DONANTE' | 'TIPO' | 'ESTADO' | 'PEDIDO' | null;
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

  popover: PopoverKey = null;
  overlayTop = 0;
  overlayLeft = 0;
  overlayWidth = 240;

  filtroFecha = '';
  filtroDonante = '';
  filtroPedido = '';
  tipoFiltro: TipoFiltro = 'TODOS';
  estadoFiltro: EstadoFiltro = 'TODOS';

  onRowClick(turno: Turno): void {
    this.selectTurno.emit(turno);
  }

  open(key: Exclude<PopoverKey, null>, ev: MouseEvent, width = 240): void {
    ev.stopPropagation();

    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();

    this.overlayWidth = width;

    const top = r.bottom + 10;
    let left = r.left + r.width / 2 - width / 2;

    const pad = 10;
    const maxLeft = window.innerWidth - width - pad;
    if (left < pad) left = pad;
    if (left > maxLeft) left = maxLeft;

    this.overlayTop = top;
    this.overlayLeft = left;
    this.popover = key;
  }

  close(): void {
    this.popover = null;
  }

  stop(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }

  clearFecha(): void {
    this.filtroFecha = '';
  }

  clearDonante(): void {
    this.filtroDonante = '';
  }

  clearPedido(): void {
    this.filtroPedido = '';
  }

  setTipo(t: TipoFiltro): void {
    this.tipoFiltro = t;
    this.close();
  }

  setEstado(e: EstadoFiltro): void {
    this.estadoFiltro = e;
    this.close();
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

  get turnosProcesados(): Turno[] {
    const fFecha = this.filtroFecha.trim();
    const fDon = this.filtroDonante.trim().toLowerCase();
    const fPed = this.filtroPedido.trim().toLowerCase();

    const filtered = this.turnos.filter(t => {
      const okFecha = !fFecha || t.fecha === fFecha;
      const okDon = !fDon || (t.nombreDonante || '').toLowerCase().includes(fDon);
      const okPed = !fPed || (t.pedidoId || '').toLowerCase().includes(fPed);
      const okTipo = this.tipoFiltro === 'TODOS' || t.tipoDonacion === this.tipoFiltro;
      const okEstado = this.estadoFiltro === 'TODOS' || t.estado === this.estadoFiltro;
      return okFecha && okDon && okPed && okTipo && okEstado;
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

    return [...upcoming, ...past];
  }
}
