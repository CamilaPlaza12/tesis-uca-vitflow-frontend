import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  HospitalRequest,
  HospitalRequestCreate,
  UpdateHospitalRequestRequest,
  TiposSangreDisponibles,
  CancelRequestResponse,
  PendingClassificationsResponse,
} from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  //private baseUrl = 'https://vitflow-backend.onrender.com';
  private baseUrl = 'http://localhost:8000';
  private endpoint = `${this.baseUrl}/api/v1/hospital-requests`;

  constructor(private http: HttpClient) {}

  getHospitalRequests(): Observable<HospitalRequest[]> {
    return this.http.get<HospitalRequest[]>(`${this.endpoint}/`);
  }

  getHospitalRequestById(requestId: string): Observable<HospitalRequest> {
    return this.http.get<HospitalRequest>(`${this.endpoint}/${requestId}`);
  }

  createHospitalRequest(body: HospitalRequestCreate): Observable<HospitalRequest> {
    return this.http.post<HospitalRequest>(`${this.endpoint}/`, body);
  }

  updateHospitalRequest(
    requestId: string,
    body: UpdateHospitalRequestRequest
  ): Observable<HospitalRequest> {
    return this.http.patch<HospitalRequest>(`${this.endpoint}/${requestId}`, body);
  }

  cancelHospitalRequest(requestId: string): Observable<CancelRequestResponse> {
    return this.http.post<CancelRequestResponse>(`${this.endpoint}/${requestId}/cancel`, null);
  }

  getTiposSangreDisponibles(componente: string): Observable<TiposSangreDisponibles> {
    const params = new HttpParams().set('componente', componente);
    return this.http.get<TiposSangreDisponibles>(
      `${this.endpoint}/tipos-sangre-disponibles`,
      { params }
    );
  }

  getPendingClassifications(requestId: string): Observable<PendingClassificationsResponse> {
    return this.http.get<PendingClassificationsResponse>(
      `${this.endpoint}/${requestId}/pending-classifications`
    );
  }
}
