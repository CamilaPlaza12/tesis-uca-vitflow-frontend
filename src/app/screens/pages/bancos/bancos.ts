import { Component, OnInit } from '@angular/core';
import { BloodBankService } from '../../../service/blood-bank.service';
import { BloodBank } from '../../../models/blood-bank.model';

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


}
