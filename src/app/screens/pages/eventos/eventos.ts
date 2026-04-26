import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EventosService } from '../../../service/eventos_service';
import { Evento, EventoResumen } from '../../../models/evento';

type ToastKind = 'success' | 'error' | 'info';
type Vista = 'dashboard' | 'historial' | 'detalle';

@Component({
  selector: 'app-eventos',
  standalone: false,
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class EventosComponent implements OnInit {
  cargando = true;
  eventoActivo: Evento | null = null;
  todos: EventoResumen[] = [];
  vista: Vista = 'dashboard';
  eventoDetalle: Evento | null = null;
  cargandoDetalle = false;
  crearOpen = false;

  toastOpen = false;
  toastText = '';
  toastKind: ToastKind = 'success';
  private toastTimer: any = null;

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando = true;
    forkJoin({
      activo: this.eventosService.getEventoActivo(),
      lista: this.eventosService.getEventos(),
    }).subscribe({
      next: ({ activo, lista }) => {
        this.eventoActivo = activo;
        this.todos = lista;
        this.cargando = false;
        this.vista = activo ? 'dashboard' : 'historial';
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.showToast('Error al cargar los eventos.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  get todosOrdenados(): EventoResumen[] {
    return [...this.todos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  verHistorial(): void {
    this.vista = 'historial';
  }

  volverAlDashboard(): void {
    this.vista = 'dashboard';
  }

  volverAlHistorial(): void {
    this.vista = 'historial';
    this.eventoDetalle = null;
  }

  verDetalle(evento: EventoResumen): void {
    if (this.eventoActivo && evento.id === this.eventoActivo.id) {
      this.eventoDetalle = this.eventoActivo;
      this.vista = 'detalle';
      return;
    }
    this.cargandoDetalle = true;
    this.vista = 'detalle';
    this.cdr.detectChanges();
    this.eventosService.getEvento(evento.id).subscribe({
      next: (e) => {
        this.eventoDetalle = e;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoDetalle = false;
        this.vista = 'historial';
        this.showToast('Error al cargar el evento.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  openCrear(): void {
    this.crearOpen = true;
    document.body.classList.add('modal-open');
  }

  closeCrear(): void {
    this.crearOpen = false;
    document.body.classList.remove('modal-open');
  }

  onEventoCreado(evento: Evento): void {
    this.closeCrear();
    this.showToast(`Evento "${evento.nombre}" creado exitosamente.`, 'success');
    this.cargar();
  }

  onEventoFinalizado(): void {
    this.eventoDetalle = null;
    this.showToast('Evento finalizado correctamente.', 'success');
    this.cargar();
  }

  onEventoCancelado(): void {
    this.eventoDetalle = null;
    this.showToast('Evento cancelado correctamente.', 'success');
    this.cargar();
  }

  estadoBadgeClass(estado: string): string {
    if (estado === 'ACTIVO') return 'badge--activo';
    if (estado === 'CANCELADO') return 'badge--danger';
    return 'badge--neutral';
  }

  estadoLabel(estado: string): string {
    if (estado === 'ACTIVO') return 'Activo';
    if (estado === 'FINALIZADO') return 'Finalizado';
    if (estado === 'CANCELADO') return 'Cancelado';
    return estado;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const [yyyy, mm, dd] = fecha.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  formatHorario(horaInicio?: string, horaFin?: string): string {
    if (!horaInicio && !horaFin) return '—';
    if (horaInicio && horaFin) return `${horaInicio} – ${horaFin}`;
    return horaInicio || horaFin || '—';
  }

  private showToast(text: string, kind: ToastKind): void {
    this.toastText = text;
    this.toastKind = kind;
    this.toastOpen = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastOpen = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  closeToast(): void {
    this.toastOpen = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
