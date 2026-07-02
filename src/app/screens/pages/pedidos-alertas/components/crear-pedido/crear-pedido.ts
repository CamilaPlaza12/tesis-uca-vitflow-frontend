import { Component, EventEmitter, HostListener, Output, ChangeDetectorRef } from '@angular/core';
import {
  HospitalRequest,
  HospitalRequestCreate,
  HospitalUnit,
  HospitalRequestType,
} from '../../../../../models/pedido';
import { PedidoService } from '../../../../../service/pedido_service';

type DropKey = 'servicio' | 'componente' | 'grupo';


@Component({
  selector: 'app-crear-pedido',
  standalone: false,
  templateUrl: './crear-pedido.html',
  styleUrl: './crear-pedido.scss',
})
export class CrearPedido {
  @Output() pedidoCreado = new EventEmitter<HospitalRequest>();

  open = false;
  loading = false;
  cargandoGrupos = false;
  today = new Date().toISOString().split('T')[0];

  servicios: HospitalUnit[] = [
    'ITU',
    'Terapia Intensiva',
    'Guardia',
    'Quirofano',
    'Clinica Medica',
  ];

  //componentes: string[] = ['Sangre', 'Plaquetas'];
    componentes: string[] = ['Sangre'];

  grupos: string[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  dropdownOpen: Record<DropKey, boolean> = {
    servicio: false,
    componente: false,
    grupo: false,
  };

  tiposRequest: HospitalRequestType[] = ['NORMAL', 'CAMPAÑA'];

  form = {
    servicio: 'ITU' as HospitalUnit,
    componente: 'Sangre',
    grupoSanguineo: 'O-',
    solicitadoPor: '',
    comentarios: '',
    fechaVencimiento: '',
    tipoRequest: 'NORMAL' as HospitalRequestType,
  };

  errorMsg = '';
  tiposNoDisponibles: string[] = [];

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  onClick(): void {
    this.openModal();
  }

  readonly DEFAULT_DESCRIPTION =
    'Este pedido apuntará a todos los donantes compatibles con el grupo sanguíneo seleccionado.';

  openModal(): void {
    this.open = true;
    this.errorMsg = '';
    this.tiposNoDisponibles = [];
    this.closeAllDropdowns();
    document.body.classList.add('modal-open');
    if (!this.form.solicitadoPor) this.form.solicitadoPor = 'Dra. García';
    if (!this.form.comentarios) this.form.comentarios = '';
    this.loadTiposDisponibles();
  }

  closeModal(): void {
    if (this.loading) return;
    this.open = false;
    this.errorMsg = '';
    this.closeAllDropdowns();
    document.body.classList.remove('modal-open');
  }

  stop(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  closeAllDropdowns(): void {
    this.dropdownOpen.servicio = false;
    this.dropdownOpen.componente = false;
    this.dropdownOpen.grupo = false;
  }

  toggleDropdown(key: DropKey): void {
    const next = !this.dropdownOpen[key];
    this.closeAllDropdowns();
    this.dropdownOpen[key] = next;
  }

  selectServicio(s: HospitalUnit): void {
    this.form.servicio = s;
    this.dropdownOpen.servicio = false;
  }

  selectComponente(c: string): void {
    this.form.componente = c;
    this.dropdownOpen.componente = false;
  }

  selectGrupo(g: string): void {
    if (!this.isGrupoDisponible(g)) return;
    this.form.grupoSanguineo = g;
    this.dropdownOpen.grupo = false;
  }

  isGrupoDisponible(g: string): boolean {
    return !this.tiposNoDisponibles.includes(g);
  }

  private loadTiposDisponibles(): void {
    this.cargandoGrupos = true;
    this.pedidoService.getHospitalRequests().subscribe({
      next: (requests) => {
        this.tiposNoDisponibles = requests
          .filter((r) => r.status === 'ACTIVO' && r.tipo === 'manual')
          .map((r) => r.blood_group);
        this.cargandoGrupos = false;
        if (!this.isGrupoDisponible(this.form.grupoSanguineo)) {
          const primer = this.grupos.find((g) => this.isGrupoDisponible(g));
          if (primer) this.form.grupoSanguineo = primer;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiposNoDisponibles = [];
        this.cargandoGrupos = false;
        this.cdr.detectChanges();
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (!this.open) return;
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.dropdown')) return;
    this.closeAllDropdowns();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open) this.closeModal();
  }

  validar(): boolean {
    if (!this.form.solicitadoPor || this.form.solicitadoPor.trim().length < 2) {
      this.errorMsg = 'Completá el campo "Solicitado por".';
      return false;
    }

    if (!this.form.fechaVencimiento) {
      this.errorMsg = 'Completá la fecha de vencimiento del pedido.';
      return false;
    }

    if (!this.isGrupoDisponible(this.form.grupoSanguineo)) {
      this.errorMsg = 'Ya existe un pedido manual activo para ese grupo sanguíneo.';
      return false;
    }

    return true;
  }

  crear(): void {
    if (this.loading) return;
    this.errorMsg = '';
    if (!this.validar()) return;

    const body: HospitalRequestCreate = {
      hospital_unit: this.form.servicio,
      component: this.form.componente,
      blood_group: this.form.grupoSanguineo,
      priority: 'NORMAL',
      requested_by: this.form.solicitadoPor.trim(),
      end_date: this.form.fechaVencimiento,
      comments: this.form.comentarios?.trim() || null,
      request_type: this.form.tipoRequest,
      tipo: 'manual',
    };

    this.loading = true;
    this.cdr.detectChanges();

    this.pedidoService.createHospitalRequest(body).subscribe({
      next: (pedido) => {
        this.loading = false;
        this.pedidoCreado.emit(pedido);
        this.resetForm();
        this.open = false;
        document.body.classList.remove('modal-open');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMsg =
            err?.error?.detail ||
            'Ya existe un pedido activo para este grupo sanguíneo.';
        } else if (err.status === 400 || err.status === 422) {
          this.errorMsg = err?.error?.detail || 'Datos inválidos. Revisá el formulario.';
        } else {
          this.errorMsg = 'Error al crear el pedido. Intentá de nuevo.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private resetForm(): void {
    this.errorMsg = '';
    this.tiposNoDisponibles = [];
    this.form.comentarios = '';
    this.form.componente = 'Sangre';
    this.form.grupoSanguineo = 'O-';
    this.form.servicio = 'ITU';
    this.form.fechaVencimiento = '';
    this.form.tipoRequest = 'NORMAL';
  }
}
