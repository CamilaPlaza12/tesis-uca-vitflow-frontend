import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BloodType } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-blood-manual-actions',
  standalone: false,
  templateUrl: './blood-manual-actions.html',
  styleUrl: './blood-manual-actions.scss',
})
export class BloodManualActions {
  @Input() stocks!: Record<BloodType, number>;
  @Output() applyChange = new EventEmitter<{ action: 'add' | 'remove'; bloodType: BloodType; amountMl: number }>();

  modalOpen = false;
  modalAction: 'add' | 'remove' = 'add';

  historyOpen = false;

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  selectedType: BloodType = 'A+';
  amountMl = 500;

  open(action: 'add' | 'remove'): void {
    this.modalAction = action;
    this.modalOpen = true;

    if (action === 'remove') {
      const max = this.maxAmount();
      if (max > 0 && Number(this.amountMl || 0) > max) this.amountMl = max;
    }
  }

  close(): void {
    this.modalOpen = false;
    this.amountMl = 500;
    this.selectedType = 'A+';
  }

  openHistory(): void {
    this.historyOpen = true;
  }

  closeHistory(): void {
    this.historyOpen = false;
  }

  title(): string {
    return this.modalAction === 'add' ? 'Agregar stock' : 'Quitar stock';
  }

  subtitle(): string {
    return 'Acciones manuales (ajustes, descartes o correcciones)';
  }

  currentStock(): number {
    return Number(this.stocks?.[this.selectedType] ?? 0);
  }

  maxAmount(): number {
    if (this.modalAction === 'remove') return Math.max(0, this.currentStock());
    return 5_000_000;
  }

  removeError(): string | null {
    if (this.modalAction !== 'remove') return null;

    const stock = this.currentStock();
    const val = Number(this.amountMl ?? 0);

    if (stock <= 0) return 'No hay stock disponible para descontar en este grupo.';
    if (!val || val <= 0) return 'Ingresá una cantidad válida.';
    if (val > stock) return `No podés descontar más de ${stock} ml.`;
    return null;
  }

  canConfirm(): boolean {
    const val = Number(this.amountMl ?? 0);
    if (!val || val <= 0) return false;

    if (this.modalAction === 'remove') {
      // ✅ condición dura: si no hay stock, jamás confirmás
      if (this.currentStock() <= 0) return false;
      return this.removeError() === null;
    }

    return true;
  }

  get confirmDisabled(): boolean {
    return !this.canConfirm();
  }

  confirm(): void {
    // ✅ blindaje final: aunque lleguen acá, corta
    if (this.confirmDisabled) return;

    const amt = Math.max(1, Math.floor(Number(this.amountMl || 0)));

    if (this.modalAction === 'remove') {
      const stock = this.currentStock();
      if (stock <= 0) return;
      if (amt > stock) return;
    }

    this.applyChange.emit({
      action: this.modalAction,
      bloodType: this.selectedType,
      amountMl: amt,
    });

    this.close();
  }

  onTypeChange(): void {
    if (this.modalAction === 'remove') {
      const max = this.maxAmount();
      if (max > 0 && Number(this.amountMl || 0) > max) this.amountMl = max;
    }
  }
}
