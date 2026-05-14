import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { BloodType, ComponenteSanguineo, GrupoSanguineo, ResumenDashboard, UmbralStock } from '../../../models/blood-bank.model';
import { StockService } from '../../../service/stock_service';
import { TurnoService } from '../../../service/turno_service';
import { PedidoService } from '../../../service/pedido_service';

export type DonationType = 'SANGRE' | 'PLAQUETAS' | 'MEDULA_OSEA';
export type AppointmentStatus =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'COMPLETADO'
  | 'PENDIENTE_CLASIFICACION'
  | 'NO_PRESENTADO';

export type RequestPriority = 'URGENTE' | 'NORMAL' | 'CRITICA';
export type RequestStatus = 'ACTIVO' | 'COMPLETO' | 'CANCELADO' | 'FINALIZADO';

export interface DonationAppointmentRow {
  time_local: string;
  date_local?: string;
  donation_type: DonationType;
  status: AppointmentStatus;
  blood_group?: string | null;
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
  end_date?: string;
}

interface HomeSummaryResponse {
  stocks: Record<BloodType, number>;
  thresholds: Partial<Record<BloodType, number>>;
  kpis: {
    totalUnits: number;
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
  kpiAppointmentsToday = 0;

  umbrales: UmbralStock[] = [];

  get criticalGroupsCount(): number {
    if (!this.stockDashboard) return 0;
    const groups: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components: ComponenteSanguineo[] = ['globulos_rojos', 'plasma', 'plaquetas'];
    return groups.filter((group) =>
      components.some((comp) => {
        const stock = this.stockDashboard![comp][group] ?? 0;
        const umbral = this.umbrales.find((u) => u.componente === comp && u.blood_group === group);
        const minimo = umbral?.umbral_minimo ?? 0;
        return minimo > 0 && stock < minimo;
      })
    ).length;
  }

  appointments: DonationAppointmentRow[] = [];
  activeRequests: ActiveRequestRow[] = [];

  loading = false;
  private baseUrl = 'http://localhost:8000/api/v1';
  //private baseUrl = 'https://vitflow-backend.onrender.com/api/v1';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private stockService: StockService,
    private turnoService: TurnoService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.currentDateLabel = this.buildCurrentDateLabel();
    this.loading = true;
    this.loadHomeSummary();
    this.loadStockDashboard();
    this.loadStockTotales();
    this.loadUmbrales();
    this.loadAppointmentsWindow();
    this.loadActiveRequests();
  }

  private loadHomeSummary(): void {
    this.http.get<HomeSummaryResponse>(`${this.baseUrl}/home/summary`).subscribe({
      next: (data) => {
        this.stocksRecord = { ...(data.stocks || this.stocksRecord) };
        this.thresholdsRecord = { ...(data.thresholds || {}) };

        // kpiTotalUnits is loaded separately from /stock/totales
        this.kpiAppointmentsToday = data.kpis?.appointmentsToday ?? 0;

        // activeRequests loaded separately via loadActiveRequests()

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

  private loadActiveRequests(): void {
    this.pedidoService.getHospitalRequests().subscribe({
      next: (requests) => {
        this.activeRequests = requests
          .filter((r) => r.status === 'ACTIVO')
          .map((r) => ({
            date: r.datetime_local?.split('T')[0] ?? '',
            hospital_unit: r.hospital_unit,
            component: r.component,
            blood_group: r.blood_group,
            requested_units: r.requested_units ?? 1,
            priority: r.priority,
            status: r.status,
            end_date: r.end_date,
          }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading active requests:', err);
      },
    });
  }

  private loadStockTotales(): void {
    this.stockService.getStockTotales().subscribe({
      next: (data) => {
        this.kpiTotalUnits = data.total ?? 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stock totales:', err);
      },
    });
  }

  private loadAppointmentsWindow(): void {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.turnoService.getTurnosByRange(fmt(today), fmt(tomorrow)).subscribe({
      next: (turnos) => {
        this.appointments = turnos
          .filter((t) => t.status !== 'CANCELADO' && t.status !== 'NO_PRESENTADO')
          .sort((a, b) => {
            const da = `${a.date_local}T${a.time_local}`;
            const db = `${b.date_local}T${b.time_local}`;
            return da < db ? -1 : da > db ? 1 : 0;
          })
          .map((t) => ({
            time_local: t.time_local,
            date_local: t.date_local,
            donation_type: t.donation_type,
            status: t.status as DonationAppointmentRow['status'],
            blood_group: t.blood_group || t.donor?.blood_group || null,
          }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments window:', err);
      },
    });
  }

  private loadUmbrales(): void {
    this.stockService.getUmbrales().subscribe({
      next: (rows) => {
        this.umbrales = rows ?? [];
        this.cdr.detectChanges();
      },
      error: () => {},
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
