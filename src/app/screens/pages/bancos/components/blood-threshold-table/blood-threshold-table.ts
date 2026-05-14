import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BloodType } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-blood-threshold-table',
  standalone: false,
  templateUrl: './blood-threshold-table.html',
  styleUrl: './blood-threshold-table.scss',
})
export class BloodThresholdTable implements OnChanges {

  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;

  @Output() thresholdChange = new EventEmitter<{ bloodType: BloodType; thresholdUnits: number }>();

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  editOpen = false;
  editType: BloodType | null = null;
  editValue: number = 0;

  ngOnChanges(changes: SimpleChanges): void {}

  openEdit(type: BloodType): void {
    this.editType = type;
    this.editValue = Number(this.thresholds?.[type] ?? 0);
    this.editOpen = true;
  }

  cancelEdit(): void {
    this.editOpen = false;
    this.editType = null;
    this.editValue = 0;
  }

saveEdit(): void {
  if (!this.editType) return;
  const value = Math.max(0, Math.floor(Number(this.editValue || 0)));
  this.thresholdChange.emit({ bloodType: this.editType, thresholdUnits: value });
  this.cancelEdit();
}

  getStatus(type: BloodType): 'ok' | 'bajo' | 'critico' {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return 'ok';
    if (stock <= thr) return 'critico';
    if (stock <= thr * 1.3) return 'bajo';
    return 'ok';
  }

  statusLabel(s: 'ok' | 'bajo' | 'critico'): string {
    if (s === 'critico') return 'Crítico';
    if (s === 'bajo') return 'Bajo';
    return 'OK';
  }
}
