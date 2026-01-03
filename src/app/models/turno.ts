export type DonationType = 'SANGRE' | 'PLAQUETAS' | 'MEDULA_OSEA';

export type AppointmentStatus =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'COMPLETADO'
  | 'NO_PRESENTADO';

export interface Turno {
  id: string;

  pedidoId: string;
  fecha: string;
  hora: string;
  tipoDonacion: DonationType;
  estado: AppointmentStatus;

  nombreDonante: string;
}
