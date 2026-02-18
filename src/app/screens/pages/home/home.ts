import { Component } from '@angular/core';
import { Router } from '@angular/router';

// AJUSTÁ ESTE PATH al real en tu repo
import { BloodType } from '../../../models/blood-bank.model';

export type DonationType = 'Sangre' | 'Plaquetas' | 'Médula';
export type AppointmentStatus = 'Confirmado' | 'Pendiente' | 'Cancelado';

export type RequestPriority = 'Urgente' | 'Normal';
export type RequestStatus = 'Activo' | 'Completado';

export interface DonationAppointmentRow {
  time: string; // "08:30"
  donation: DonationType;
  status: AppointmentStatus;
}

export interface ActiveRequestRow {
  date: string; // "12/04/2024"
  service: string; // "UTI"
  component: string; // "Sangre O-"
  quantity: number;
  priority: RequestPriority;
  status: RequestStatus;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  hospitalName = 'Hospital Central de CABA';
  currentDateLabel = '18 de marzo de 2024';
  unreadNotifications = 1;

  // ✅ Formato correcto para el chart que ya tenés (stocks/thresholds)
  stocksRecord: Record<BloodType, number> = {
    'A+': 28,
    'A-': 26,
    'B+': 55,
    'B-': 38,
    'AB+': 37,
    'AB-': 35,
    'O+': 52,
    'O-': 34,
  };

  thresholdsRecord: Partial<Record<BloodType, number>> = {
    'A+': 20,
    'A-': 20,
    'B+': 20,
    'B-': 20,
    'AB+': 15,
    'AB-': 15,
    'O+': 25,
    'O-': 25,
  };

  kpiTotalUnits = Object.values(this.stocksRecord).reduce(
    (a, v) => a + (Number(v) || 0),
    0
  );

  kpiUrgentActive = 1;
  kpiAppointmentsToday = 14;

  criticalGroupsThreshold = 20;
  criticalGroupsCount = (Object.entries(this.stocksRecord) as Array<[BloodType, number]>).filter(
    ([t, v]) => Number(v) < Number(this.thresholdsRecord?.[t] ?? this.criticalGroupsThreshold)
  ).length;

  appointments: DonationAppointmentRow[] = [
    { time: '08:30', donation: 'Sangre', status: 'Confirmado' },
    { time: '09:15', donation: 'Plaquetas', status: 'Confirmado' },
    { time: '10:45', donation: 'Médula', status: 'Pendiente' },
    { time: '11:00', donation: 'Sangre', status: 'Cancelado' },
  ];

  activeRequests: ActiveRequestRow[] = [
    {
      date: '12/04/2024',
      service: 'UTI',
      component: 'Sangre O-',
      quantity: 2,
      priority: 'Urgente',
      status: 'Activo',
    },
    {
      date: '11/04/2024',
      service: 'Guardia',
      component: 'Plaquetas A+',
      quantity: 1,
      priority: 'Normal',
      status: 'Activo',
    },
    {
      date: '11/04/2024',
      service: 'Terapia',
      component: 'Sangre A-',
      quantity: 4,
      priority: 'Normal',
      status: 'Activo',
    },
    {
      date: '10/04/2024',
      service: 'Terapia',
      component: 'Plaquetas B+',
      quantity: 1,
      priority: 'Normal',
      status: 'Completado',
    },
  ];

  constructor(private router: Router) {}

  onCreateDonationRequest(): void {
    this.router.navigate(['/pedidos-y-alertas']);
  }

  onOpenNotifications(): void {
    this.router.navigate(['/pedidos-y-alertas']);
  }
}
