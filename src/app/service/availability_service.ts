import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap, timeout } from 'rxjs';
import { HospitalAvailability } from '../models/disponibilidad';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private baseUrl = 'https://vitflow-backend.onrender.com';
  private endpoint = `${this.baseUrl}/api/v1/hospital-availability`;

  constructor(private http: HttpClient) {}

  getHospitalAvailability(): Observable<HospitalAvailability> {
    const startedAt = performance.now();

    return this.http.get<HospitalAvailability>(this.endpoint).pipe(
      timeout(15000), // 15s: si no responde, cortamos
      tap({
        next: (res) => {
          const ms = Math.round(performance.now() - startedAt);
          console.log('✅ getHospitalAvailability OK', { ms, res });
        },
        error: (e) => {
          const ms = Math.round(performance.now() - startedAt);
          console.log('❌ getHospitalAvailability ERROR', { ms, e });
        },
      }),
      finalize(() => console.log('ℹ️ getHospitalAvailability finalize()'))
    );
  }

  saveHospitalAvailability(body: HospitalAvailability): Observable<HospitalAvailability> {
    const startedAt = performance.now();

    return this.http.put<HospitalAvailability>(this.endpoint, body).pipe(
      timeout(15000),
      tap({
        next: (res) => {
          const ms = Math.round(performance.now() - startedAt);
          console.log('✅ saveHospitalAvailability OK', { ms, res });
        },
        error: (e) => {
          const ms = Math.round(performance.now() - startedAt);
          console.log('❌ saveHospitalAvailability ERROR', { ms, e });
        },
      }),
      finalize(() => console.log('ℹ️ saveHospitalAvailability finalize()'))
    );
  }
}
