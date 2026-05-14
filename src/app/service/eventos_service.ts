import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  Evento,
  EventoResumen,
  DashboardEvento,
  TurnosCount,
  Turno,
  PendienteClasificacion,
  CrearEventoDTO,
  EditarEventoDTO,
} from '../models/evento';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private base = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getEventos(): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.base}/eventos/`);
  }

  getEventoActivo(): Observable<Evento | null> {
    return this.http.get<Evento>(`${this.base}/eventos/activo/`).pipe(
      catchError(() => of(null))
    );
  }

  getEvento(eventoId: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.base}/eventos/${eventoId}`);
  }

  cancelarEvento(eventoId: string): Observable<{ id: string; estado: string; mensaje: string }> {
    return this.http.patch<{ id: string; estado: string; mensaje: string }>(
      `${this.base}/eventos/${eventoId}/cancelar`,
      {}
    );
  }

  crearEvento(data: CrearEventoDTO): Observable<Evento> {
    return this.http.post<Evento>(`${this.base}/eventos/`, data);
  }

  editarEvento(eventoId: string, data: Partial<EditarEventoDTO>): Observable<Evento> {
    return this.http.patch<Evento>(`${this.base}/eventos/${eventoId}`, data);
  }

  finalizarEvento(eventoId: string): Observable<{ id: string; estado: string; mensaje: string }> {
    return this.http.patch<{ id: string; estado: string; mensaje: string }>(
      `${this.base}/eventos/${eventoId}/finalizar`,
      {}
    );
  }

  getDashboard(eventoId: string): Observable<DashboardEvento> {
    return this.http.get<DashboardEvento>(`${this.base}/eventos/${eventoId}/dashboard`);
  }

  // Registra llegada del donante → turno pasa a PENDIENTE_CLASIFICACION
  registrarDonacion(
    eventoId: string,
    dni: string
  ): Observable<Turno> {
    return this.http.post<Turno>(
      `${this.base}/eventos/${eventoId}/registrar-donacion`,
      { dni }
    );
  }

  // Turnos en estado PENDIENTE_CLASIFICACION para el evento
  getPendientesClasificacion(eventoId: string): Observable<PendienteClasificacion[]> {
    return this.http.get<PendienteClasificacion[]>(
      `${this.base}/eventos/${eventoId}/pendientes-clasificacion`
    );
  }

  getTurnosCount(requestId: string): Observable<TurnosCount> {
    return this.http.get<TurnosCount>(`${this.base}/appointments/request/${requestId}/count`);
  }

  getTurnos(requestId: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.base}/appointments/request/${requestId}`);
  }

  // Clasifica donación → turno pasa a COMPLETADO y actualiza stock
  clasificarDonacion(
    turnoId: string,
    componentes: string[]
  ): Observable<Turno & { mensaje?: string }> {
    return this.http.post<Turno & { mensaje?: string }>(
      `${this.base}/appointments/${turnoId}/confirmar-asistencia`,
      { componentes }
    );
  }
}
