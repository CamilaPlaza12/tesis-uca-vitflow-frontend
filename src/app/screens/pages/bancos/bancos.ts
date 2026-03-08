import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { BloodBank, BloodType } from '../../../models/blood-bank.model';
import { BloodBankService } from '../../../service/blood_bank_service';


@Component({
  selector: 'app-bancos',
  standalone: false,
  templateUrl: './bancos.html',
  styleUrl: './bancos.scss',
})
export class Bancos implements OnInit {
  bloodBank!: BloodBank;

  loading = true;
  saving = false;
  errorMsg = '';

  constructor(private bloodBankService: BloodBankService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.loading = true;
    this.errorMsg = '';

    this.bloodBankService.getBloodBank().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.bloodBank = res;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorMsg = err?.error?.detail || 'Error cargando banco de sangre';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

onThresholdChange(ev: { bloodType: BloodType; thresholdMl: number }): void {
  console.log('thresholdChange event', ev);
  if (!this.bloodBank) return;

  const bt = ev.bloodType;

  // asegurá el objeto
  this.bloodBank.thresholds_ml = this.bloodBank.thresholds_ml ?? ({} as any);

  const prev = Number(this.bloodBank.thresholds_ml?.[bt] ?? 0);

  // optimistic update
  this.bloodBank.thresholds_ml[bt] = ev.thresholdMl;

  this.saving = true;
  this.errorMsg = '';
  this.cdr.detectChanges();

  this.bloodBankService.updateThreshold(bt, ev.thresholdMl).subscribe({
    next: (res) => {
      this.zone.run(() => {
        this.bloodBank = res;
        this.saving = false;
        this.cdr.detectChanges();
      });
    },
    error: (err) => {
      this.zone.run(() => {
        // rollback
        this.bloodBank.thresholds_ml[bt] = prev;
        this.errorMsg = err?.error?.detail || 'Error guardando umbral';
        this.saving = false;
        this.cdr.detectChanges();
      });
    },
  });
}

  onManualChange(ev: { action: 'add' | 'remove'; bloodType: BloodType; amountMl: number }): void {
    if (!this.bloodBank) return;

    const bt = ev.bloodType;
    const amount = Number(ev.amountMl ?? 0);
    const prev = Number(this.bloodBank.stocks_ml?.[bt] ?? 0);

    // optimistic update
    if (ev.action === 'add') {
      this.bloodBank.stocks_ml[bt] = prev + amount;
    } else {
      this.bloodBank.stocks_ml[bt] = Math.max(0, prev - amount);
    }

    this.saving = true;
    this.errorMsg = '';

    const req$ =
      ev.action === 'add'
        ? this.bloodBankService.addStock(bt, amount)
        : this.bloodBankService.removeStock(bt, amount);

    req$.subscribe({
      next: (res) => {
        this.bloodBank = res;
        this.saving = false;
      },
      error: (err) => {
        // rollback
        this.bloodBank.stocks_ml[bt] = prev;
        this.errorMsg = err?.error?.detail || 'Error aplicando ajuste';
        this.saving = false;
      },
    });
  }
}