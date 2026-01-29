import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HospitalAvailability } from '../models/disponibilidad';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private baseUrl = 'http://localhost:8000';
  private endpoint = `${this.baseUrl}/api/v1/hospital-availability`;

  constructor(private http: HttpClient) {}

  // GET /hospital-availability (el back identifica al hospital por el token)
  getHospitalAvailability(): Observable<HospitalAvailability> {
    return this.http.get<HospitalAvailability>(this.endpoint);
  }

  // PUT /hospital-availability
  saveHospitalAvailability(body: HospitalAvailability): Observable<HospitalAvailability> {
    return this.http.put<HospitalAvailability>(this.endpoint, body);
  }
}