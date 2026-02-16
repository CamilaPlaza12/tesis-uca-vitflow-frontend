import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BloodType } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-blood-stock-chart',
  standalone: false,
  templateUrl: './blood-stock-chart.html',
  styleUrl: './blood-stock-chart.scss',
})
export class BloodStockChart implements OnChanges {

  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  chartData: any;
  chartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stocks'] || changes['thresholds']) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const labels = this.bloodTypes;
    const values = labels.map(t => Number(this.stocks?.[t] ?? 0));
    const thresholds = labels.map(t => Number(this.thresholds?.[t] ?? 0));

    const colors = labels.map(t => this.getBarColor(t));
    const borderColors = labels.map(t => this.getBarBorderColor(t));

    // Línea de umbral (dataset tipo line)
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
          borderRadius: 10,
          barThickness: 34,
        },
        {
          type: 'line',
          label: 'Umbral mínimo (ml)',
          data: thresholds,
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
          ticks: { font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eef2f6' },
          ticks: {
            callback: (v: number) => `${v} ml`,
            font: { size: 12 },
          },
        },
      },
    };
  }

  // celeste ok, naranja bajo, rojo crítico
  private getBarColor(type: BloodType): string {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return 'rgba(125, 211, 252, 0.75)'; // sin umbral: lo tratamos como ok
    if (stock <= thr) return 'rgba(239, 68, 68, 0.78)';       // rojo
    if (stock <= thr * 1.3) return 'rgba(249, 115, 22, 0.78)';// naranja
    return 'rgba(125, 211, 252, 0.82)';                        // celeste
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
