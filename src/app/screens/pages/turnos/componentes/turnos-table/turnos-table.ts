import { Component, Input } from '@angular/core';
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

  todayStr = this.toISODate(new Date());

  desde = this.todayStr;
  hasta = this.todayStr;
  donante = '';
  tipo: TipoFiltro = 'TODOS';

  onDesdeChange(v: string): void {
    const next = this.clampToToday(v);
    this.desde = next;
    if (this.hasta < this.desde) this.hasta = this.desde;
  }

  onHastaChange(v: string): void {
    const next = this.clampToToday(v);
    this.hasta = next;
    if (this.hasta < this.desde) this.desde = this.hasta;
  }

  clear(): void {
    this.desde = this.todayStr;
    this.hasta = this.todayStr;
    this.donante = '';
    this.tipo = 'TODOS';
  }

  exportCSV(): void {
    const headers = [
      'Fecha',
      'Hora',
      'Donante',
      'Tipo de donación',
      'Estado',
      'Pedido'
    ];

    const rows = this.turnosProcesados.map(t => ([
      t.fecha,
      t.hora,
      t.nombreDonante ?? '',
      this.tipoHuman(t.tipoDonacion),
      this.estadoHuman(t.estado),
      t.pedidoId ?? '',
    ]));

    const csv = this.toCSV([headers, ...rows], ';');

    const blob = new Blob(
      [this.withUtf8Bom(csv)],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_turnos_${this.desde}_a_${this.hasta}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
    if (fecha > this.todayStr) return false;
    if (this.desde && fecha < this.desde) return false;
    if (this.hasta && fecha > this.hasta) return false;
    return true;
  }

  private clampToToday(v: string): string {
    return v > this.todayStr ? this.todayStr : v;
  }

  private toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private toCSV(rows: string[][], sep: string): string {
    return rows
      .map(r => r.map(c => this.csvCell(c)).join(sep))
      .join('\r\n');
  }

  private csvCell(v: string): string {
    const s = String(v ?? '');
    const escaped = s.replace(/"/g, '""');
    return /[;"\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }

  private withUtf8Bom(s: string): string {
    return '\uFEFF' + s;
  }

  get turnosProcesados(): Turno[] {
    const qDon = this.donante.trim().toLowerCase();

    return this.turnos
      .filter(t => {
        const okFecha = this.inRange(t.fecha);
        const okDon = !qDon || (t.nombreDonante || '').toLowerCase().includes(qDon);
        const okTipo = this.tipo === 'TODOS' || t.tipoDonacion === this.tipo;
        return okFecha && okDon && okTipo;
      })
      .sort((a, b) => this.turnoDateTime(b) - this.turnoDateTime(a));
  }
}
