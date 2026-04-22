import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno, AppointmentStatus } from '../models/turno';
import { ComponenteSanguineo } from '../models/blood-bank.model';

export interface UnidadCreada {
  id: string;
  componente: ComponenteSanguineo;
  blood_group: string;
  fecha_vencimiento: string;
  estado: string;
}

export interface ConfirmarAsistenciaResponse {
  appointment_id: string;
  status: string;
  unidades_creadas: UnidadCreada[];
}

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private baseUrl = 'http://localhost:8000';
  //private baseUrl = 'https://vitflow-backend.onrender.com';
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

  confirmarAsistencia(
    appointmentId: string,
    body: { blood_group: string; componentes: ComponenteSanguineo[] }
  ): Observable<ConfirmarAsistenciaResponse> {
    return this.http.post<ConfirmarAsistenciaResponse>(
      `${this.endpoint}/${appointmentId}/confirmar-asistencia`,
      body
    );
  }
}
