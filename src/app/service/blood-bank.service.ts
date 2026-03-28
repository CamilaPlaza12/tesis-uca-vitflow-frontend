import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BloodBank } from '../models/blood-bank.model';

@Injectable({ providedIn: 'root' })
export class BloodBankService {

  getBloodBank(): Observable<BloodBank> {
    return of({
      hospital_id: 'hospital-demo',
      stocks_units: {
        'A+': 1200,
        'A-': 700,
        'B+': 300,
        'B-': 150,
        'AB+': 400,
        'AB-': 80,
        'O+': 2000,
        'O-': 500,
      },
      thresholds_units: {
        'A+': 600,
        'A-': 500,
        'B+': 400,
        'B-': 200,
        'AB+': 300,
        'AB-': 150,
        'O+': 1000,
        'O-': 600,
      }
    });
  }
}
