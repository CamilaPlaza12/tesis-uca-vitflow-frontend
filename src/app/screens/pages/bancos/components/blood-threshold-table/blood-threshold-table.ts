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

  // listo para cuando conectemos back
  @Output() thresholdChange = new EventEmitter<{ bloodType: BloodType; thresholdMl: number }>();

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  editOpen = false;
  editType: BloodType | null = null;
  editValue: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // nada por ahora; sirve si más adelante querés recalcular algo
  }

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
    this.thresholdChange.emit({ bloodType: this.editType, thresholdMl: value });

    // mock: reflejarlo local para que se vea el cambio sin back
    (this.thresholds as any)[this.editType] = value;

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

  // iconito lápiz sin depender de PrimeIcons (por si no los tenés)
  pencilSvg = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `;
}
