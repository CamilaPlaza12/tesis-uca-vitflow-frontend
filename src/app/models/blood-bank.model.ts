export type BloodType =
  | 'A+' | 'A-' | 'B+' | 'B-'
  | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodBank {
  hospital_id: string;
  stocks_units: Record<BloodType, number>;
  thresholds_units: Partial<Record<BloodType, number>>;
}
