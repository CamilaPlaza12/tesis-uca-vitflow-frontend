import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  HospitalRequest,
  HospitalRequestCreate,
  UpdateHospitalRequestRequest,
  // Si lo tenés definido también:
  // UpdateHospitalRequestStatusRequest
} from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = 'http://localhost:8000';
  private endpoint = `${this.baseUrl}/api/v1/hospital-requests`;

  constructor(private http: HttpClient) {}

  // GET /hospital-requests/
  getHospitalRequests(): Observable<HospitalRequest[]> {
    return this.http.get<HospitalRequest[]>(`${this.endpoint}/`);
  }

  // GET /hospital-requests/{request_id}
  getHospitalRequestById(requestId: string): Observable<HospitalRequest> {
    return this.http.get<HospitalRequest>(`${this.endpoint}/${requestId}`);
  }

  // POST /hospital-requests/
  createHospitalRequest(body: HospitalRequestCreate): Observable<HospitalRequest> {
    return this.http.post<HospitalRequest>(`${this.endpoint}/`, body);
  }

  // PATCH /hospital-requests/{request_id}
  updateHospitalRequest(
    requestId: string,
    body: UpdateHospitalRequestRequest
  ): Observable<HospitalRequest> {
    return this.http.patch<HospitalRequest>(`${this.endpoint}/${requestId}`, body);
  }

  // (Opcional) helper si querés actualizar SOLO status más cómodo
  // updateHospitalRequestStatus(
  //   requestId: string,
  //   status: HospitalRequestStatus
  // ): Observable<HospitalRequest> {
  //   return this.http.patch<HospitalRequest>(`${this.endpoint}/${requestId}`, { status });
  // }
}
