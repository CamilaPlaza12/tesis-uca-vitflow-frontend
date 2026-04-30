import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { PendienteClasificacion } from '../../../../../models/evento';
import { EventosService } from '../../../../../service/eventos_service';

interface PendienteItem extends PendienteClasificacion {
  selectedComponentes: string[];
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
    { value: 'plasma', label: 'Plasma' },
    { value: 'plaquetas', label: 'Plaquetas' },
    { value: 'globulos_rojos', label: 'Glóbulos rojos' },
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
        this.pendientes = data.map((t) => ({
          ...t,
          selectedComponentes: [],
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

  isSelected(item: PendienteItem, value: string): boolean {
    return item.selectedComponentes.includes(value);
  }

  toggleComponente(item: PendienteItem, value: string): void {
    item.error = null;
    if (item.selectedComponentes.includes(value)) {
      item.selectedComponentes = item.selectedComponentes.filter((c) => c !== value);
    } else {
      item.selectedComponentes = [...item.selectedComponentes, value];
    }
  }

  guardar(item: PendienteItem): void {
    if (item.selectedComponentes.length === 0 || item.loading) return;
    item.loading = true;
    item.error = null;
    this.cdr.detectChanges();

    this.eventosService
      .clasificarDonacion(item.turno_id, item.selectedComponentes)
      .subscribe({
        next: () => {
          this.pendientes = this.pendientes.filter((p) => p.turno_id !== item.turno_id);
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

  getNombre(item: PendienteClasificacion): string {
    return item.donante_nombre || item.donante_dni;
  }
}
