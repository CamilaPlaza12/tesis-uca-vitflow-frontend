import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Evento, DashboardEvento } from '../../../../../models/evento';
import { EventosService } from '../../../../../service/eventos_service';

type ToastKind = 'success' | 'error';

@Component({
  selector: 'app-dashboard-evento',
  standalone: false,
  templateUrl: './dashboard-evento.html',
  styleUrl: './dashboard-evento.scss',
})
export class DashboardEventoComponent implements OnInit, OnDestroy {
  @Input() evento!: Evento;
  @Output() eventoFinalizado = new EventEmitter<void>();
  @Output() eventoCancelado = new EventEmitter<void>();

  dashboard: DashboardEvento | null = null;
  cargandoDashboard = true;

  finalizarConfirmOpen = false;
  finalizarLoading = false;
  finalizarError: string | null = null;

  cancelarConfirmOpen = false;
  cancelarLoading = false;
  cancelarError: string | null = null;

  toastOpen = false;
  toastText = '';
  toastKind: ToastKind = 'success';
  private toastTimer: any = null;
  private pollingInterval: any = null;

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
    if (this.evento.estado === 'ACTIVO') {
      this.pollingInterval = setInterval(() => {
        this.cargarDashboard();
      }, 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private cargarDashboard(): void {
    this.eventosService.getDashboard(this.evento.id).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.cargandoDashboard = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoDashboard = false;
        this.cdr.detectChanges();
      },
    });
  }

  get esHoy(): boolean {
    if (!this.evento?.fecha) return false;
    const hoy = new Date();
    const fechaHoy = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    return this.evento.fecha === fechaHoy;
  }

  get soloLectura(): boolean {
    if (this.evento.estado !== 'ACTIVO') return true;
    return !this.esHoy;
  }

  get puedeCancelar(): boolean {
    return this.evento.estado === 'ACTIVO' && !this.esHoy;
  }

  get badgeClass(): string {
    switch (this.evento.estado) {
      case 'ACTIVO': return 'badge--activo';
      case 'CANCELADO': return 'badge--cancelado';
      case 'FINALIZADO': return 'badge--finalizado';
      default: return 'badge--neutral';
    }
  }

  get estadoBadgeLabel(): string {
    switch (this.evento.estado) {
      case 'ACTIVO': return 'ACTIVO';
      case 'FINALIZADO': return 'FINALIZADO';
      case 'CANCELADO': return 'CANCELADO';
      default: return this.evento.estado;
    }
  }

  onDonacionRegistrada(): void {
    this.cargarDashboard();
  }

  onClasificacionRealizada(): void {
    this.cargarDashboard();
  }

  openFinalizarConfirm(): void {
    this.finalizarConfirmOpen = true;
    this.finalizarError = null;
    document.body.classList.add('modal-open');
  }

  closeFinalizarConfirm(): void {
    if (this.finalizarLoading) return;
    this.finalizarConfirmOpen = false;
    this.finalizarError = null;
    document.body.classList.remove('modal-open');
  }

  confirmarFinalizar(): void {
    if (this.finalizarLoading) return;
    this.finalizarLoading = true;
    this.cdr.detectChanges();

    this.eventosService.finalizarEvento(this.evento.id).subscribe({
      next: () => {
        this.finalizarLoading = false;
        this.finalizarConfirmOpen = false;
        document.body.classList.remove('modal-open');
        this.eventoFinalizado.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.finalizarLoading = false;
        this.finalizarError = err?.error?.detail || 'No se pudo finalizar el evento.';
        this.cdr.detectChanges();
      },
    });
  }

  openCancelarConfirm(): void {
    this.cancelarConfirmOpen = true;
    this.cancelarError = null;
    document.body.classList.add('modal-open');
  }

  closeCancelarConfirm(): void {
    if (this.cancelarLoading) return;
    this.cancelarConfirmOpen = false;
    this.cancelarError = null;
    document.body.classList.remove('modal-open');
  }

  confirmarCancelar(): void {
    if (this.cancelarLoading) return;
    this.cancelarLoading = true;
    this.cdr.detectChanges();

    this.eventosService.cancelarEvento(this.evento.id).subscribe({
      next: () => {
        this.cancelarLoading = false;
        this.cancelarConfirmOpen = false;
        document.body.classList.remove('modal-open');
        this.eventoCancelado.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cancelarLoading = false;
        this.cancelarError = err?.error?.detail || 'No se pudo cancelar el evento.';
        this.cdr.detectChanges();
      },
    });
  }

  get subtitulo(): string {
    const parts: string[] = [];
    if (this.evento.fecha) {
      const [yyyy, mm, dd] = this.evento.fecha.split('-');
      parts.push(`${dd}/${mm}/${yyyy}`);
    }
    const horaParts: string[] = [];
    if (this.evento.hora_inicio) horaParts.push(this.evento.hora_inicio);
    if (this.evento.hora_fin) horaParts.push(this.evento.hora_fin);
    if (horaParts.length) parts.push(horaParts.join(' – '));
    if (this.evento.lugar) parts.push(this.evento.lugar);
    return parts.join(' · ');
  }

  closeToast(): void {
    this.toastOpen = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
