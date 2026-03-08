import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloodBank, BloodType } from '../models/blood-bank.model';

@Injectable({ providedIn: 'root' })
export class BloodBankService {
  private baseUrl = 'http://localhost:8000';
  private endpoint = `${this.baseUrl}/api/v1/blood-bank`;

  constructor(private http: HttpClient) {}

  getBloodBank(): Observable<BloodBank> {
    return this.http.get<BloodBank>(`${this.endpoint}`);
  }

  updateThreshold(bloodType: BloodType, thresholdMl: number): Observable<BloodBank> {
    return this.http.patch<BloodBank>(`${this.endpoint}/thresholds`, {
      thresholds_ml: { [bloodType]: thresholdMl },
    });
  }

  addStock(bloodType: BloodType, amountMl: number): Observable<BloodBank> {
    return this.http.patch<BloodBank>(`${this.endpoint}/add-stock`, {
      blood_type: bloodType,
      amount_ml: amountMl,
    });
  }

  removeStock(bloodType: BloodType, amountMl: number): Observable<BloodBank> {
    return this.http.patch<BloodBank>(`${this.endpoint}/remove-stock`, {
      blood_type: bloodType,
      amount_ml: amountMl,
    });
  }
}