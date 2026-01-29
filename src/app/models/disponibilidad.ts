export type Weekday =
  | 'Lunes'
  | 'Martes'
  | 'Miercoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sabado'
  | 'Domingo';

export interface TimeSlot {
  time: string;     // "HH:mm"
  capacity: number; // 1..999
}

export interface AvailabilityDay {
  day: Weekday;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface HospitalAvailability {
  id_hospital?: number | string;
  days: AvailabilityDay[]; // idealmente 7, uno por día
}
