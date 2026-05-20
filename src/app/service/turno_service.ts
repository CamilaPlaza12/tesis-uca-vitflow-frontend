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

// POST /confirmar-asistencia — sin body, mueve a PENDIENTE_CLASIFICACION
export interface MarcarAsistenciaResponse {
  appointment_id: string;
  status: string; // "PENDIENTE_CLASIFICACION"
}

// POST /classify-components — registra componentes, mueve a COMPLETADO
export interface ClasificarComponentesResponse {
  appointment_id: string;
  status: string; // "COMPLETADO"
  unidades_creadas: UnidadCreada[];
}

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private baseUrl = 'https://vitflow-backend.onrender.com';
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

  // Paso 1: donante llegó → PENDIENTE_CLASIFICACION. Sin body.
  confirmarAsistencia(appointmentId: string): Observable<MarcarAsistenciaResponse> {
    return this.http.post<MarcarAsistenciaResponse>(
      `${this.endpoint}/${appointmentId}/confirmar-asistencia`,
      null
    );
  }

  // Paso 2: registrar componentes → COMPLETADO
  clasificarComponentes(
    appointmentId: string,
    componentes: ComponenteSanguineo[]
  ): Observable<ClasificarComponentesResponse> {
    return this.http.post<ClasificarComponentesResponse>(
      `${this.endpoint}/${appointmentId}/classify-components`,
      { componentes }
    );
  }
}
