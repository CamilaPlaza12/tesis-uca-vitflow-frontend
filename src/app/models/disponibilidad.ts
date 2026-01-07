export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface HorarioCapacidad {
  hora: string; // "HH:mm"
  capacidad: number;
}

export interface DisponibilidadDia {
  id_hospital: number | string;
  dia: DiaSemana;
  horarios: HorarioCapacidad[];
}
