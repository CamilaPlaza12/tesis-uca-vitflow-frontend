import { Component, OnInit } from '@angular/core';
import { BloodBankService } from '../../../service/blood-bank.service';
import { BloodBank, BloodType } from '../../../models/blood-bank.model';

@Component({
  selector: 'app-bancos',
  standalone: false,
  templateUrl: './bancos.html',
  styleUrl: './bancos.scss',
})
export class Bancos implements OnInit {

  bloodBank!: BloodBank;
  loading = true;

  constructor(private bloodBankService: BloodBankService) {}

  ngOnInit(): void {
    this.bloodBankService.getBloodBank().subscribe(res => {
      this.bloodBank = res;
      this.loading = false;
    });
  }

  onThresholdChange(ev: { bloodType: BloodType; thresholdMl: number }): void {
    // mock (después conectamos PATCH /blood-bank/thresholds)
    this.bloodBank.thresholds_ml[ev.bloodType] = ev.thresholdMl;
  }

  onManualChange(ev: { action: 'add' | 'remove'; bloodType: BloodType; amountMl: number }): void {
    // mock (después conectamos PATCH /blood-bank/add o /blood-bank/remove)
    const prev = Number(this.bloodBank.stocks_ml[ev.bloodType] ?? 0);

    if (ev.action === 'add') {
      this.bloodBank.stocks_ml[ev.bloodType] = prev + ev.amountMl;
      return;
    }

    this.bloodBank.stocks_ml[ev.bloodType] = Math.max(0, prev - ev.amountMl);
  }
}
