import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { BloodType, ResumenDashboard } from '../../../models/blood-bank.model';
import { StockService } from '../../../service/stock_service';

export type DonationType = 'SANGRE' | 'PLAQUETAS' | 'MEDULA_OSEA';
export type AppointmentStatus =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'COMPLETADO'
  | 'NO_PRESENTADO';

export type RequestPriority = 'URGENTE' | 'NORMAL' | 'CRITICA';
export type RequestStatus = 'ACTIVO' | 'COMPLETO' | 'CANCELADO' | 'FINALIZADO';

export interface DonationAppointmentRow {
  time_local: string;
  date_local?: string;
  donation_type: DonationType;
  status: AppointmentStatus;
}

export interface ActiveRequestRow {
  date: string;
  hospital_unit: string;
  component: string;
  blood_group: string;
  requested_units: number;
  priority: RequestPriority;
  status: RequestStatus;
  fecha_fin?: string;
}

interface HomeSummaryResponse {
  stocks: Record<BloodType, number>;
  thresholds: Partial<Record<BloodType, number>>;
  kpis: {
    totalUnits: number;
    urgentActive: number;
    appointmentsToday: number;
    criticalGroupsCount: number;
  };
  appointments: DonationAppointmentRow[];
  activeRequests: ActiveRequestRow[];
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  currentDateLabel = '';
  unreadNotifications = 0;

  stocksRecord: Record<BloodType, number> = {
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
  };

  thresholdsRecord: Partial<Record<BloodType, number>> = {};

  stockDashboard: ResumenDashboard | null = null;
  stockDashboardLoading = false;

  kpiTotalUnits = 0;
  kpiUrgentActive = 0;
  kpiAppointmentsToday = 0;
  criticalGroupsCount = 0;

  appointments: DonationAppointmentRow[] = [];
  activeRequests: ActiveRequestRow[] = [];

  loading = false;

  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private stockService: StockService,
  ) {}

  ngOnInit(): void {
    this.currentDateLabel = this.buildCurrentDateLabel();
    this.loading = true;
    this.loadHomeSummary();
    this.loadStockDashboard();
  }

  private loadHomeSummary(): void {
    this.http.get<HomeSummaryResponse>(`${this.baseUrl}/home/summary`).subscribe({
      next: (data) => {
        this.stocksRecord = { ...(data.stocks || this.stocksRecord) };
        this.thresholdsRecord = { ...(data.thresholds || {}) };

        this.kpiTotalUnits = data.kpis?.totalUnits ?? 0;
        this.kpiUrgentActive = data.kpis?.urgentActive ?? 0;
        this.kpiAppointmentsToday = data.kpis?.appointmentsToday ?? 0;
        this.criticalGroupsCount = data.kpis?.criticalGroupsCount ?? 0;

        this.appointments = [...(data.appointments || [])];
        this.activeRequests = [...(data.activeRequests || [])];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading home summary:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadStockDashboard(): void {
    this.stockDashboardLoading = true;

    this.stockService.getDashboardResumen().subscribe({
      next: (data) => {
        this.stockDashboard = data;
        this.stockDashboardLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stock dashboard:', err);
        this.stockDashboardLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildCurrentDateLabel(): string {
    const d = new Date();
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  onCreateDonationRequest(): void {
    this.router.navigate(['/pedidos-alertas']);
  }

  onOpenNotifications(): void {
    this.router.navigate(['/pedidos-alertas']);
  }
}
