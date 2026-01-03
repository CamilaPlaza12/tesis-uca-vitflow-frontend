
export type HospitalRequestPriority = 'NORMAL' | 'URGENTE' | 'CRITICA';

export type HospitalRequestStatus =
  | 'ACTIVO'
  | 'COMPLETO'
  | 'CANCELADO'
  | 'FINALIZADO';

export type HospitalUnit =
  | 'ITU'
  | 'Terapia Intensiva'
  | 'Guardia'
  | 'Quirofano'
  | 'Clinica Medica';

export interface HospitalRequestCreate {
  hospital_unit: HospitalUnit;
  component: string;
  blood_group: string;
  requested_liters: number;
  priority: HospitalRequestPriority;
  requested_by: string;
  comments?: string | null;
}

export interface HospitalRequest {
  id: string;
  datetime_local: string;
  hospital_unit: HospitalUnit;
  component: string;
  blood_group: string;
  requested_liters: number;
  collected_liters: number;
  priority: HospitalRequestPriority;
  status: HospitalRequestStatus;
  requested_by: string;
  comments?: string | null;
}

export interface UpdateHospitalRequestStatusRequest {
  status: HospitalRequestStatus;
}

export interface UpdateHospitalRequestRequest {
  hospital_unit?: HospitalUnit;
  priority?: HospitalRequestPriority;
  status?: HospitalRequestStatus;
  comments?: string | null;
}