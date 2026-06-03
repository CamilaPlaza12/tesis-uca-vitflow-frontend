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
  @Output() search = new EventEmitter<{ desde: string; hasta: string }>();
  @Output() clearFilters = new EventEmitter<void>();

  private turnosHistorico: Turno[] = [];

  @Input() set turnos(value: Turno[] | null | undefined) {
    this.turnosHistorico = value ?? [];
  }

  loading = false;
  errorMsg = '';

  todayStr = this.toISODate(new Date());
  desde = this.todayStr;
  hasta = this.todayStr;

  donante = '';
  tipo: TipoFiltro = 'TODOS';
  estado: EstadoFiltro = 'TODOS';

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

  buscar(): void {
    this.search.emit({ desde: this.desde, hasta: this.hasta });
  }

  clear(): void {
    this.desde = this.todayStr;
    this.hasta = this.todayStr;
    this.donante = '';
    this.tipo = 'TODOS';
    this.estado = 'TODOS';
    this.clearFilters.emit();
  }

  exportCSV(): void {
    const headers = ['Fecha', 'Hora', 'Donante', 'Tipo de donación', 'Estado', 'Pedido'];

    const rows: string[][] = this.turnosProcesados.map((t) => [
      t.date_local,
      t.time_local,
      t.donor?.full_name ?? '',
      this.tipoHuman(t.donation_type),
      this.estadoHuman(t.status),
      t.hospital_request_id ? String(t.hospital_request_id) : '',
    ]);

    const csv = this.toCSV([headers, ...rows], ';');
    const blob = new Blob([this.withUtf8Bom(csv)], { type: 'text/csv;charset=utf-8;' });
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
    if (s === 'PENDIENTE_CLASIFICACION') return 'Pend. clasificación';
    return 'Cancelado';
  }

  get turnosProcesados(): Turno[] {
    const qDon = this.donante.trim().toLowerCase();

    return this.turnosHistorico
      .filter((t) => {
        const okFecha = this.inRange(t.date_local);
        const okDon = !qDon || ((t.donor?.full_name || '').toLowerCase().includes(qDon));
        const okTipo = this.tipo === 'TODOS' || t.donation_type === this.tipo;
        const okEstado = this.estado === 'TODOS' || t.status === this.estado;
        return okFecha && okDon && okTipo && okEstado;
      })
      .sort((a, b) => this.turnoDateTime(b) - this.turnoDateTime(a));
  }

  private turnoDateTime(t: Turno): number {
    return new Date(`${t.date_local}T${t.time_local || '00:00'}:00`).getTime();
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
    return rows.map((r) => r.map((c) => this.csvCell(c)).join(sep)).join('\r\n');
  }

  private csvCell(v: string): string {
    const s = String(v ?? '');
    const escaped = s.replace(/"/g, '""');
    return /[;"\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }

  private withUtf8Bom(s: string): string {
    return '\uFEFF' + s;
  }
}
