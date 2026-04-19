
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

export type HospitalRequestType = 'NORMAL' | 'CAMPAÑA';

export interface HospitalRequestCreate {
  hospital_unit: HospitalUnit;
  component: string;
  blood_group: string;
  requested_units: number;
  priority: HospitalRequestPriority;
  requested_by: string;
  end_date: string;
  comments?: string | null;
  request_type?: HospitalRequestType;
}

export interface HospitalRequest {
  id: string;
  datetime_local: string;
  hospital_unit: HospitalUnit;
  component: string;
  blood_group: string;
  requested_units: number;
  collected_units: number;
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