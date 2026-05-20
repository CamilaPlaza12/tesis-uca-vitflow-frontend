import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { HospitalAvailability } from '../models/disponibilidad';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  //private baseUrl = 'http://localhost:8000';
  private baseUrl = 'https://vitflow-backend.onrender.com';
  private endpoint = `${this.baseUrl}/api/v1/hospital-availability`;

  constructor(private http: HttpClient) {}

  getHospitalAvailability(): Observable<HospitalAvailability> {
    return this.http.get<HospitalAvailability>(this.endpoint).pipe(
      timeout(15000),
    );
  }

  saveHospitalAvailability(body: HospitalAvailability): Observable<HospitalAvailability> {
    return this.http.put<HospitalAvailability>(this.endpoint, body).pipe(
      timeout(15000),
    );
  }
}
