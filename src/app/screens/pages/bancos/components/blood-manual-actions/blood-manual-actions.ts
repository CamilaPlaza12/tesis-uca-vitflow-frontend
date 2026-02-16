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

    bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    selectedType: BloodType = 'A+';
    amountMl = 500;


    open(action: 'add' | 'remove'): void {
      this.modalAction = action;
      this.modalOpen = true;
    }

    close(): void {
      this.modalOpen = false;
      this.amountMl = 500;
      this.selectedType = 'A+';
    }

    confirm(): void {
      const amt = Math.max(1, Math.floor(Number(this.amountMl || 0)));
      this.applyChange.emit({
        action: this.modalAction,
        bloodType: this.selectedType,
        amountMl: amt,
      });
      this.close();
    }

    title(): string {
      return this.modalAction === 'add' ? 'Agregar stock' : 'Quitar stock';
    }

    subtitle(): string {
      return 'Acciones manuales (para ajustes, descartes o correcciones)';
    }
  }
