export type DonationType = 'SANGRE' | 'PLAQUETAS' | 'MEDULA_OSEA';

export type AppointmentStatus =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'COMPLETADO'
  | 'NO_PRESENTADO';

export interface Donor {
  full_name: string;
  dni: string;
}

export interface Turno {
  // Idealmente el back lo incluye; si no, lo agregamos después
  id: string;

  hospital_request_id: string;
  date_local: string;     // "YYYY-MM-DD"
  time_local: string;     // "HH:mm"
  donor: Donor;
  donation_type: DonationType;
  status: AppointmentStatus;
  
}
