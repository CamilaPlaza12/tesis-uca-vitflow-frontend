import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobResult {
  updated: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminJobsService {
  private baseUrl = 'https://vitflow-backend.onrender.com/api/v1/admin/jobs';

  constructor(private http: HttpClient) {}

  finalizarPedidosVencidos(): Observable<JobResult> {
    return this.http.post<JobResult>(`${this.baseUrl}/finalizar-pedidos-vencidos`, {});
  }

  marcarNoPresentes(): Observable<JobResult> {
    return this.http.post<JobResult>(`${this.baseUrl}/marcar-no-presentados`, {});
  }
}
