export type BloodType =
  | 'A+' | 'A-' | 'B+' | 'B-'
  | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodBank {
  hospital_id: string;
  stocks_ml: Record<BloodType, number>;
  thresholds_ml: Partial<Record<BloodType, number>>;
}
