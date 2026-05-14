export type BloodType =
  | 'A+' | 'A-' | 'B+' | 'B-'
  | 'AB+' | 'AB-' | 'O+' | 'O-';

export type GrupoSanguineo = BloodType;

export type ComponenteSanguineo = 'globulos_rojos' | 'plasma' | 'plaquetas';

export type EstadoUnidad = 'disponible' | 'usado' | 'vencido';

export interface BloodBank {
  hospital_id: string;
  stocks_units: Record<BloodType, number>;
  thresholds_units: Partial<Record<BloodType, number>>;
}

export interface UnidadStock {
  id: string;
  hospital_id: string;
  blood_group: GrupoSanguineo;
  fecha_creacion: string;
  fecha_vencimiento: string;
  estado: EstadoUnidad;
  turno_id: string | null;
  donante_id: string | null;
}

export type ComponenteResumen = Record<GrupoSanguineo, number> & { total: number };

export interface ResumenDashboard {
  globulos_rojos: ComponenteResumen;
  plasma: ComponenteResumen;
  plaquetas: ComponenteResumen;
}

export interface UmbralStock {
  id: string;
  hospital_id: string;
  componente: ComponenteSanguineo;
  blood_group: GrupoSanguineo;
  umbral_minimo: number;
}

export interface HistorialEntry {
  id: string;
  fecha: string;           // backend sends "fecha", ISO 8601
  usuario_nombre: string;
  accion: 'agrego' | 'retiro';   // backend sends "agrego"/"retiro"
  componente: ComponenteSanguineo;
  blood_group: GrupoSanguineo;
  cantidad: number;
  motivo?: string | null;
  motivo_detalle?: string | null;
}
