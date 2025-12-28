import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Pedido, PedidoEstado, PedidoPrioridad } from '../../../../../models/pedido';

type DropKey = 'servicio' | 'componente' | 'grupo' | 'prioridad';

@Component({
  selector: 'app-crear-pedido',
  standalone: false,
  templateUrl: './crear-pedido.html',
  styleUrl: './crear-pedido.scss',
})
export class CrearPedido {
  @Output() pedidoCreado = new EventEmitter<Pedido>();

  open = false;

  servicios: string[] = ['UTI', 'Terapia Intensiva', 'Guardia', 'Quirófano', 'Clínica Médica'];
  componentes: string[] = ['Sangre', 'Plaquetas', 'Plasma'];
  grupos: string[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  prioridades: PedidoPrioridad[] = ['NORMAL', 'URGENTE', 'CRITICA'];

  dropdownOpen: Record<DropKey, boolean> = {
    servicio: false,
    componente: false,
    grupo: false,
    prioridad: false,
  };

  form = {
    servicio: 'UTI',
    componente: 'Sangre',
    grupoSanguineo: 'O-',
    prioridad: 'NORMAL' as PedidoPrioridad,
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
    document.body.classList.add('modal-open'); // ✅ bloquea scroll y “apaga” fondo
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

  selectServicio(s: string): void {
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

  selectPrioridad(p: PedidoPrioridad): void {
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

  prioridadLabel(p: PedidoPrioridad): string {
    if (p === 'CRITICA') return 'Crítica';
    if (p === 'URGENTE') return 'Urgente';
    return 'Normal';
  }

  formatNow(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} · ${hh}:${min}`;
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

    const pedido: Pedido = {
      id: `p-${Date.now()}`,
      fechaHora: this.formatNow(),
      servicio: this.form.servicio,
      componente: this.form.componente,
      grupoSanguineo: this.form.grupoSanguineo,
      prioridad: this.form.prioridad,
      estado: 'ACTIVO' as PedidoEstado,
      solicitadoPor: this.form.solicitadoPor.trim(),
      comentarios: this.form.comentarios?.trim() || undefined,
      cantidadSolicitadaMl: this.toMlFromLitros(litros),
      cantidadObtenidaMl: 0,
    };

    this.pedidoCreado.emit(pedido);

    this.form.comentarios = '';
    this.form.litrosSolicitados = 1;
    this.form.prioridad = 'NORMAL';
    this.form.componente = 'Sangre';
    this.form.grupoSanguineo = 'O-';
    this.form.servicio = 'UTI';

    this.closeModal();
  }
}
