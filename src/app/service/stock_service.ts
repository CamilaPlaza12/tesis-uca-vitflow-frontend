import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ComponenteSanguineo,
  GrupoSanguineo,
  ResumenDashboard,
  UnidadStock,
  UmbralStock,
} from '../models/blood-bank.model';

export interface ConfirmarDonacionBody {
  turno_id: string;
  donante_id: string;
  blood_group: string;
  componentes: ComponenteSanguineo[];
}

export interface ConfirmarDonacionResponse {
  turno_id: string;
  donante_id: string;
  unidades_creadas: UnidadStock[];
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private base = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getDashboardResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${this.base}/stock/dashboard/resumen`);
  }

  getUnidadesDisponibles(componente: ComponenteSanguineo): Observable<UnidadStock[]> {
    return this.http.get<UnidadStock[]>(`${this.base}/stock/${componente}/disponibles`);
  }

  agregarUnidad(
    componente: ComponenteSanguineo,
    body: {
      blood_group: GrupoSanguineo;
      turno_id: string | null;
      donante_id: string | null;
    }
  ): Observable<UnidadStock> {
    return this.http.post<UnidadStock>(`${this.base}/stock/${componente}/agregar`, body);
  }

  retirarUnidad(componente: ComponenteSanguineo, id: string): Observable<UnidadStock> {
    return this.http.patch<UnidadStock>(`${this.base}/stock/${componente}/${id}/retirar`, {});
  }

  getUmbrales(): Observable<UmbralStock[]> {
    return this.http.get<UmbralStock[]>(`${this.base}/stock/umbrales`);
  }

  updateUmbral(umbralId: string, umbralMinimo: number): Observable<UmbralStock> {
    return this.http.patch<UmbralStock>(`${this.base}/stock/umbrales/${umbralId}`, {
      umbral_minimo: umbralMinimo,
    });
  }

  confirmarDonacion(body: ConfirmarDonacionBody): Observable<ConfirmarDonacionResponse> {
    return this.http.post<ConfirmarDonacionResponse>(`${this.base}/donaciones/confirmar`, body);
  }
}
