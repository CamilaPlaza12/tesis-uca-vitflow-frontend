export type OnboardingStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface HospitalAddress {
  province: string;
  localidad: string;
  city: string;
  street: string;
  number: string;
  provinceId: string;
  localidadId: string;
}

export interface HospitalData {
  name: string;
  email: string;
  phone: string;
  address: HospitalAddress;
}

export interface AdminData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dni: string;
}

export interface HospitalOnboardingRequest {
  hospital: HospitalData;
  admin: AdminData;
  status: OnboardingStatus;
  createdAt: string;
  updatedAt: string;
}
