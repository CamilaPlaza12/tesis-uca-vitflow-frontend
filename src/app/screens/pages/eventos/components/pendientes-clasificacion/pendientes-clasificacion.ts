import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { RegistroDonacion } from '../../../../../models/evento';
import { EventosService } from '../../../../../service/eventos_service';

interface PendienteItem extends RegistroDonacion {
  selectedComponente: string;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-pendientes-clasificacion',
  standalone: false,
  templateUrl: './pendientes-clasificacion.html',
  styleUrl: './pendientes-clasificacion.scss',
})
export class PendientesClasificacionComponent implements OnInit {
  @Input() eventoId!: string;
  @Output() clasificacionRealizada = new EventEmitter<void>();

  pendientes: PendienteItem[] = [];
  cargando = true;

  readonly componentes = [
    { value: 'PLASMA', label: 'Plasma' },
    { value: 'PLAQUETAS', label: 'Plaquetas' },
    { value: 'GLOBULOS_ROJOS', label: 'Glóbulos rojos' },
    { value: 'SANGRE_ENTERA', label: 'Sangre entera' },
  ];

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.eventosService.getPendientesClasificacion(this.eventoId).subscribe({
      next: (data) => {
        this.pendientes = data.map((r) => ({
          ...r,
          selectedComponente: '',
          loading: false,
          error: null,
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectComponente(item: PendienteItem, componente: string): void {
    item.selectedComponente = componente;
    item.error = null;
  }

  guardar(item: PendienteItem): void {
    if (!item.selectedComponente || item.loading) return;
    item.loading = true;
    item.error = null;
    this.cdr.detectChanges();

    this.eventosService
      .clasificarDonacion(item.registro_id, item.selectedComponente)
      .subscribe({
        next: () => {
          this.pendientes = this.pendientes.filter(
            (p) => p.registro_id !== item.registro_id
          );
          this.clasificacionRealizada.emit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          item.loading = false;
          item.error = err?.error?.detail || 'No se pudo clasificar la donación.';
          this.cdr.detectChanges();
        },
      });
  }

  formatHora(ts: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  getNombre(item: RegistroDonacion): string {
    return item.donante_nombre || item.donante_dni;
  }
}
