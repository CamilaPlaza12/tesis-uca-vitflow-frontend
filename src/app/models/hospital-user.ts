export type MemberRole = 'HOSPITAL_ADMIN' | 'TECHNICIAN';
export type MemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

export interface HospitalUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dni?: string;
  role: MemberRole;
  status: MemberStatus;
  hospitalId?: string;
  createdAt?: string;
}