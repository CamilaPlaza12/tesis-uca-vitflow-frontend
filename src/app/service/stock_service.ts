import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ComponenteSanguineo,
  GrupoSanguineo,
  HistorialEntry,
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
  private base = 'https://vitflow-backend.onrender.com/api/v1';

  constructor(private http: HttpClient) {}

  getDashboardResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${this.base}/stock/dashboard/resumen`);
  }

  getUnidadesDisponibles(componente: ComponenteSanguineo): Observable<UnidadStock[]> {
    return this.http.get<UnidadStock[]>(`${this.base}/stock/${componente}/disponibles`);
  }

  agregarUnidad(
    componente: ComponenteSanguineo,
    body: { blood_group: GrupoSanguineo; cantidad: number }
  ): Observable<UnidadStock[]> {
    return this.http.post<UnidadStock[]>(`${this.base}/stock/${componente}/agregar`, body);
  }

  retirarUnidades(
    componente: ComponenteSanguineo,
    unidad_ids: string[],
    motivo?: string,
    motivoDetalle?: string
  ): Observable<UnidadStock[]> {
    const body: Record<string, unknown> = { unidad_ids };
    body['motivo'] = motivo || null;
    body['motivo_detalle'] = motivo === 'otro' && motivoDetalle ? motivoDetalle : null;
    return this.http.patch<UnidadStock[]>(`${this.base}/stock/${componente}/retirar`, body);
  }

  getHistorial(params: {
    componente?: ComponenteSanguineo;
    accion?: string;
    desde?: string;
    hasta?: string;
  }): Observable<HistorialEntry[]> {
    let url = `${this.base}/stock/historial`;
    const qs = new URLSearchParams();
    if (params.componente) qs.set('componente', params.componente);
    if (params.accion) qs.set('accion', params.accion);
    if (params.desde) qs.set('desde', params.desde);
    if (params.hasta) qs.set('hasta', params.hasta);
    const q = qs.toString();
    if (q) url += '?' + q;
    return this.http.get<HistorialEntry[]>(url);
  }

  getStockTotales(): Observable<{
    total: number;
    globulos_rojos: number;
    plasma: number;
    plaquetas: number;
  }> {
    return this.http.get<{
      total: number;
      globulos_rojos: number;
      plasma: number;
      plaquetas: number;
    }>(`${this.base}/stock/totales`);
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
