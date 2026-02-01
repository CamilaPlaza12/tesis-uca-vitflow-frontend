import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno, AppointmentStatus } from '../models/turno';

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private baseUrl = 'http://localhost:8000';
  private endpoint = `${this.baseUrl}/api/v1/appointments`;

  constructor(private http: HttpClient) {}

  getTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.endpoint}/`);
  }

  updateStatus(appointmentId: string, status: AppointmentStatus): Observable<Turno> {
    return this.http.patch<Turno>(`${this.endpoint}/${appointmentId}/status`, { status });
  }

  reschedule(appointmentId: string, date_local: string, time_local: string): Observable<Turno> {
    return this.http.patch<Turno>(`${this.endpoint}/${appointmentId}/reschedule`, {
      date_local,
      time_local,
    });
  }

    getTurnosWindowMonths(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.endpoint}/window/months`);
  }

    getTurnosByRange(desde: string, hasta: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.endpoint}/search/${desde}/${hasta}`);
  }


}
