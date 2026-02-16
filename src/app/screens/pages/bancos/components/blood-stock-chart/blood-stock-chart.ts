import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { BloodType } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-blood-stock-chart',
  standalone: false,
  templateUrl: './blood-stock-chart.html',
  styleUrl: './blood-stock-chart.scss',
})
export class BloodStockChart implements OnChanges, AfterViewInit, OnDestroy {

  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  chartData: any;
  chartOptions: any;

  @ViewChild('chart') chart?: UIChart;
  @ViewChild('hostEl', { static: true }) hostEl!: ElementRef<HTMLElement>;

  private ro?: ResizeObserver;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stocks'] || changes['thresholds']) {
      this.buildChart();
      this.safeRefresh();
    }
  }

  ngAfterViewInit(): void {
    // ✅ refresco inicial post-render
    this.safeRefresh();

    // ✅ reflow automático cuando el contenedor cambia (sidebar open/close)
    this.ro = new ResizeObserver(() => this.safeRefresh());
    this.ro.observe(this.hostEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  private safeRefresh(): void {
    // setTimeout para esperar a que el layout se asiente
    setTimeout(() => this.chart?.refresh(), 0);
  }

  private buildChart(): void {
    const labels = this.bloodTypes;
    const values = labels.map(t => Number(this.stocks?.[t] ?? 0));
    const thrValues = labels.map(t => Number(this.thresholds?.[t] ?? 0));

    const colors = labels.map(t => this.getBarColor(t));
    const borderColors = labels.map(t => this.getBarBorderColor(t));

    this.chartData = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Stock (ml)',
          data: values,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1.2,
          borderRadius: 12,

          // ✅ más “gordas” pero escalables si sumás más categorías
          maxBarThickness: 62,
          categoryPercentage: 0.78,
          barPercentage: 0.92,
        },
        {
          type: 'line',
          label: 'Umbral mínimo (ml)',
          data: thrValues,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 10, right: 14, top: 6, bottom: 0 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.dataset?.label ?? '';
              const val = ctx.parsed?.y ?? ctx.raw ?? 0;
              return `${label}: ${val} ml`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 }, color: '#607080' },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eef2f6' },
          ticks: {
            callback: (v: number) => `${v} ml`,
            font: { size: 12 },
            color: '#607080',
          },
        },
      },
    };
  }

  private getBarColor(type: BloodType): string {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return 'rgba(125, 211, 252, 0.84)';
    if (stock <= thr) return 'rgba(239, 68, 68, 0.84)';
    if (stock <= thr * 1.3) return 'rgba(249, 115, 22, 0.84)';
    return 'rgba(125, 211, 252, 0.88)';
  }

  private getBarBorderColor(type: BloodType): string {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return 'rgba(56, 189, 248, 1)';
    if (stock <= thr) return 'rgba(220, 38, 38, 1)';
    if (stock <= thr * 1.3) return 'rgba(234, 88, 12, 1)';
    return 'rgba(56, 189, 248, 1)';
  }
}
