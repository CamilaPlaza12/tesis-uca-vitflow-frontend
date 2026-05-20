import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HospitalUser, MemberStatus } from '../models/hospital-user';

export interface CreateTechnicianRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dni: string;
}

@Injectable({
  providedIn: 'root',
})
export class EquipoRolesService {
  private baseUrl = 'https://vitflow-backend.onrender.com/api/v1/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<HospitalUser[]> {
    return this.http.get<HospitalUser[]>(this.baseUrl);
  }

  createTechnician(body: CreateTechnicianRequest): Observable<HospitalUser> {
    return this.http.post<HospitalUser>(`${this.baseUrl}/technicians`, body);
  }

  resendInvitation(
    uid: string
  ): Observable<{ ok: boolean; uid: string; email: string; status: MemberStatus }> {
    return this.http.post<{ ok: boolean; uid: string; email: string; status: MemberStatus }>(
      `${this.baseUrl}/${uid}/resend-invitation`,
      {}
    );
  }

  updateUserStatus(
    uid: string,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Observable<HospitalUser> {
    return this.http.patch<HospitalUser>(`${this.baseUrl}/${uid}/status`, { status });
  }
}
