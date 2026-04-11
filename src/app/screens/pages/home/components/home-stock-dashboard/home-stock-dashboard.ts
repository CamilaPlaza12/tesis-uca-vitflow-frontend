import {
  AfterViewInit,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GrupoSanguineo, ResumenDashboard } from '../../../../../models/blood-bank.model';
import { COMPONENT_COLORS } from '../../../../../models/component-colors';
import { UIChart } from 'primeng/chart';

const BLOOD_TYPES: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

@Component({
  selector: 'app-home-stock-dashboard',
  standalone: false,
  templateUrl: './home-stock-dashboard.html',
  styleUrl: './home-stock-dashboard.scss',
})
export class HomeStockDashboardComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() dashboard: ResumenDashboard | null = null;
  @Input() loading = false;

  @ViewChild('chartRef') chartRef?: UIChart;

  chartData: any;
  chartOptions: any;

  private reinitTimer: any = null;

  constructor(private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboard'] || changes['loading']) {
      this.buildChart();
      this.scheduleReinit();
    }
  }

  ngAfterViewInit(): void {
    this.scheduleReinit();
  }

  ngOnDestroy(): void {
    if (this.reinitTimer) clearTimeout(this.reinitTimer);
  }

  private scheduleReinit(): void {
    if (this.reinitTimer) clearTimeout(this.reinitTimer);
    this.reinitTimer = setTimeout(() => {
      this.zone.run(() => {
        this.buildChart();
        try {
          this.chartRef?.reinit();
        } catch {
          try { this.chartRef?.refresh(); } catch {}
        }
      });
    }, 90);
  }

  private buildChart(): void {
    if (!this.dashboard) return;

    const d = this.dashboard;
    const labels = BLOOD_TYPES;

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Glóbulos Rojos',
          data: labels.map((bt) => d.globulos_rojos?.[bt] ?? 0),
          backgroundColor: COMPONENT_COLORS.globulos_rojos.backgroundColor,
          borderColor: COMPONENT_COLORS.globulos_rojos.borderColor,
          borderWidth: 1.2,
          borderRadius: 6,
        },
        {
          label: 'Plasma',
          data: labels.map((bt) => d.plasma?.[bt] ?? 0),
          backgroundColor: COMPONENT_COLORS.plasma.backgroundColor,
          borderColor: COMPONENT_COLORS.plasma.borderColor,
          borderWidth: 1.2,
          borderRadius: 6,
        },
        {
          label: 'Plaquetas',
          data: labels.map((bt) => d.plaquetas?.[bt] ?? 0),
          backgroundColor: COMPONENT_COLORS.plaquetas.backgroundColor,
          borderColor: COMPONENT_COLORS.plaquetas.borderColor,
          borderWidth: 1.2,
          borderRadius: 6,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) =>
              `${ctx.dataset.label}: ${ctx.parsed?.y ?? 0} unidades`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eef2f6' },
          ticks: {
            callback: (v: number) => `${v}`,
            font: { size: 11 },
          },
        },
      },
    };
  }
}
