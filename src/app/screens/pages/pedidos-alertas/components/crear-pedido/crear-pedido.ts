import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import {
  HospitalRequestCreate,
  HospitalRequestPriority,
  HospitalUnit,
} from '../../../../../models/pedido';

type DropKey = 'servicio' | 'componente' | 'grupo' | 'prioridad';

@Component({
  selector: 'app-crear-pedido',
  standalone: false,
  templateUrl: './crear-pedido.html',
  styleUrl: './crear-pedido.scss',
})
export class CrearPedido {
  @Output() pedidoCreado = new EventEmitter<HospitalRequestCreate>();

  open = false;

  servicios: HospitalUnit[] = [
    'ITU',
    'Terapia Intensiva',
    'Guardia',
    'Quirofano',
    'Clinica Medica',
  ];

  componentes: string[] = ['Sangre', 'Plaquetas', 'Plasma'];

  grupos: string[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  prioridades: HospitalRequestPriority[] = ['NORMAL', 'URGENTE', 'CRITICA'];

  dropdownOpen: Record<DropKey, boolean> = {
    servicio: false,
    componente: false,
    grupo: false,
    prioridad: false,
  };


  form = {
    servicio: 'ITU' as HospitalUnit,
    componente: 'Sangre',
    grupoSanguineo: 'O-',
    prioridad: 'NORMAL' as HospitalRequestPriority,
    solicitadoPor: '',
    comentarios: '',
    litrosSolicitados: 1,
  };

  errorMsg = '';

  onClick(): void {
    this.openModal();
  }

  openModal(): void {
    this.open = true;
    this.errorMsg = '';
    this.closeAllDropdowns();
    document.body.classList.add('modal-open');
    if (!this.form.solicitadoPor) this.form.solicitadoPor = 'Dra. García';
  }

  closeModal(): void {
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
    this.dropdownOpen.prioridad = false;
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
    this.form.grupoSanguineo = g;
    this.dropdownOpen.grupo = false;
  }

  selectPrioridad(p: HospitalRequestPriority): void {
    this.form.prioridad = p;
    this.dropdownOpen.prioridad = false;
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

  prioridadLabel(p: HospitalRequestPriority): string {
    if (p === 'CRITICA') return 'Crítica';
    if (p === 'URGENTE') return 'Urgente';
    return 'Normal';
  }

  toMlFromLitros(l: number): number {
    return Math.round(l * 1000);
  }

  validar(): boolean {
    const litros = Number(this.form.litrosSolicitados);

    if (!this.form.solicitadoPor || this.form.solicitadoPor.trim().length < 2) {
      this.errorMsg = 'Completá el campo "Solicitado por".';
      return false;
    }

    if (!Number.isFinite(litros) || litros <= 0) {
      this.errorMsg = 'La cantidad solicitada debe ser mayor a 0.';
      return false;
    }

    if (litros > 20) {
      this.errorMsg = 'La cantidad solicitada parece muy alta (máximo 20 L).';
      return false;
    }

    return true;
  }

  crear(): void {
    this.errorMsg = '';
    if (!this.validar()) return;

    const litros = Number(this.form.litrosSolicitados);

    const pedido: HospitalRequestCreate = {
      hospital_unit: this.form.servicio,
      component: this.form.componente,
      blood_group: this.form.grupoSanguineo,
      requested_ml: this.toMlFromLitros(litros),
      priority: this.form.prioridad,
      requested_by: this.form.solicitadoPor.trim(),
      comments: this.form.comentarios?.trim() || undefined,
    };

    this.pedidoCreado.emit(pedido);

    this.form.comentarios = '';
    this.form.litrosSolicitados = 1;
    this.form.prioridad = 'NORMAL';
    this.form.componente = 'Sangre';
    this.form.grupoSanguineo = 'O-';
    this.form.servicio = 'ITU';

    this.closeModal();
  }
}
