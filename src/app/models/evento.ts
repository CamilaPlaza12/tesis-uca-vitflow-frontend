export interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  lugar?: string;
  capacidad_esperada?: number;
  estado: 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
  pedido_id: string;
  created_at: string;
  updated_at?: string;
}

export interface EventoResumen {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  lugar?: string;
  estado: 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
  total_donaciones: number;
}

export interface RegistroDonacion {
  registro_id: string;
  donante_dni: string;
  donante_nombre: string | null;
  timestamp_donacion: string;
  componente_donado: 'SANGRE_ENTERA' | 'PLASMA' | 'PLAQUETAS' | 'GLOBULOS_ROJOS' | null;
}

export interface DashboardEvento {
  evento_id: string;
  nombre: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  lugar?: string;
  estado: string;
  capacidad_esperada?: number;
  total_donaciones_registradas: number;
  pendientes_clasificacion: number;
  porcentaje_avance: number;
  por_componente: {
    plasma: number;
    plaquetas: number;
    globulos_rojos: number;
    sangre_entera: number;
    sin_clasificar: number;
  };
}

export interface TurnosCount {
  total: number;
  by_status: {
    PROGRAMADO?: number;
    CONFIRMADO?: number;
    COMPLETADO?: number;
    [key: string]: number | undefined;
  };
}

export interface Turno {
  id: string;
  full_name: string;
  dni: string;
  status: 'PROGRAMADO' | 'CONFIRMADO' | 'PENDIENTE_CLASIFICACION' | 'CANCELADO' | 'COMPLETADO';
  time_local: string;
  date_local: string;
}

export interface PendienteClasificacion {
  turno_id: string;
  donante_dni: string;
  donante_nombre: string | null;
  status: string;
  date_local: string;
  time_local: string;
}

export interface CrearEventoDTO {
  nombre: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  lugar: string | null;
  capacidad_esperada: number | null;
  grupos_sanguineos: string[];
  factores_rh: string[];
}

export interface EditarEventoDTO {
  nombre: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  lugar: string | null;
  capacidad_esperada: number | null;
}
