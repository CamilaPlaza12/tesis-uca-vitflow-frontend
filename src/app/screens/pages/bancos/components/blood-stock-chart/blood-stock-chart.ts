import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BloodType } from '../../../../../models/blood-bank.model';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-blood-stock-chart',
  standalone: false,
  templateUrl: './blood-stock-chart.html',
  styleUrl: './blood-stock-chart.scss',
})
export class BloodStockChart implements OnChanges, AfterViewInit, OnDestroy {
  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;

  // ✅ ya lo usamos para Home
  @Input() compact = false;

  // ✅ NUEVO: para Home: sin card ni header (evita bloque-dentro-de-bloque)
  @Input() embedded = false;

  @ViewChild('chartRef') chartRef?: UIChart;
  @ViewChild('wrapRef', { static: false }) wrapRef?: ElementRef<HTMLElement>;

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  chartData: any;
  chartOptions: any;

  private ro?: ResizeObserver;
  private reinitTimer: any = null;

  constructor(private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stocks'] || changes['thresholds'] || changes['compact'] || changes['embedded']) {
      this.buildChart();
      this.scheduleReinit();
    }
  }

  ngAfterViewInit(): void {
    const el = this.wrapRef?.nativeElement;

    this.zone.runOutsideAngular(() => {
      if (el && 'ResizeObserver' in window) {
        this.ro = new ResizeObserver(() => this.scheduleReinit());
        this.ro.observe(el);
      }

      this.scheduleReinit();
    });
  }

  ngOnDestroy(): void {
    if (this.ro) this.ro.disconnect();
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
          try {
            this.chartRef?.refresh();
          } catch {}
        }
      });
    }, 90);
  }

  private buildChart(): void {
    const labels = this.bloodTypes;

    const values = labels.map((t) => Number(this.stocks?.[t] ?? 0));
    const thr = labels.map((t) => Number(this.thresholds?.[t] ?? 0));

    const colors = labels.map((t) => this.getBarColor(t));
    const borders = labels.map((t) => this.getBarBorderColor(t));

    const barThickness = this.calcBarThickness(labels.length);

    this.chartData = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Stock (ml)',
          data: values,
          backgroundColor: colors,
          borderColor: borders,
          borderWidth: 1.2,
          borderRadius: 10,
          barThickness,
          maxBarThickness: barThickness,
        },
        {
          type: 'line',
          label: 'Umbral mínimo (ml)',
          data: thr,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          borderColor: 'rgba(148, 163, 184, 0.95)',
          pointBackgroundColor: 'rgba(148, 163, 184, 0.95)',
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
            font: { size: this.compact ? 11 : 12 },
          },
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
          ticks: { font: { size: this.compact ? 11 : 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eef2f6' },
          ticks: {
            callback: (v: number) => `${v} ml`,
            font: { size: this.compact ? 11 : 12 },
          },
        },
      },
    };
  }

  private calcBarThickness(count: number): number {
    const wrap = this.wrapRef?.nativeElement;
    const w = wrap?.clientWidth ?? 900;

    const perCat = w / Math.max(1, count);
    let thickness = Math.floor(perCat * 0.55);

    let min = 10;
    let max = 22;

    if (w >= 520 && w < 900) {
      min = 16;
      max = 34;
    } else if (w >= 900) {
      min = 22;
      max = 56;
    }

    thickness = Math.max(min, Math.min(max, thickness));
    return thickness;
  }

  private getBarColor(type: BloodType): string {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return 'rgba(125, 211, 252, 0.82)';
    if (stock <= thr) return 'rgba(239, 68, 68, 0.78)';
    if (stock <= thr * 1.3) return 'rgba(249, 115, 22, 0.78)';
    return 'rgba(125, 211, 252, 0.82)';
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
