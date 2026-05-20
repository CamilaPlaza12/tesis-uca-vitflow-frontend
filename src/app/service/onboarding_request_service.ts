import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HospitalOnboardingRequest } from '../models/onboarding-request';

@Injectable({ providedIn: 'root' })
export class OnboardingRequestsService {
  private baseUrl = 'https://vitflow-backend.onrender.com';
  private endpoint = `${this.baseUrl}/api/v1/hospital-onboarding/`;

  constructor(private http: HttpClient) {}

  createOnboardingRequest(
    body: HospitalOnboardingRequest
  ): Observable<any> {
    return this.http.post<any>(this.endpoint, body);
  }

  getOnboardingRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.endpoint);
  }

  reviewOnboardingRequest(
    requestId: string,
    body: {
      status: 'APPROVED' | 'REJECTED';
      reviewedBy?: string;
      reviewedAt?: string;
      reviewNote?: string;
    }
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.endpoint}${requestId}`,
      body
    );
  }
}
