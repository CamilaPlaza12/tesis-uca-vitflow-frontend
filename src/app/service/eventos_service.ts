import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  Evento,
  EventoResumen,
  RegistroDonacion,
  DashboardEvento,
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

  registrarDonacion(
    eventoId: string,
    dni: string
  ): Observable<{
    registro_id: string;
    donante_dni: string;
    donante_nombre: string | null;
    timestamp_donacion: string;
    mensaje: string;
  }> {
    return this.http.post<{
      registro_id: string;
      donante_dni: string;
      donante_nombre: string | null;
      timestamp_donacion: string;
      mensaje: string;
    }>(`${this.base}/eventos/${eventoId}/registrar-donacion`, { dni });
  }

  getDonaciones(eventoId: string): Observable<RegistroDonacion[]> {
    return this.http.get<RegistroDonacion[]>(`${this.base}/eventos/${eventoId}/donaciones`);
  }

  getPendientesClasificacion(eventoId: string): Observable<RegistroDonacion[]> {
    return this.http.get<RegistroDonacion[]>(
      `${this.base}/eventos/${eventoId}/pendientes-clasificacion`
    );
  }

  clasificarDonacion(
    registroId: string,
    componente: string
  ): Observable<RegistroDonacion & { mensaje: string }> {
    return this.http.patch<RegistroDonacion & { mensaje: string }>(
      `${this.base}/registros-donacion/${registroId}/clasificar`,
      { componente_donado: componente }
    );
  }
}
