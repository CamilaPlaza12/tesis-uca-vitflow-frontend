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
import { COMPONENT_COLORS } from '../../../../../models/component-colors';
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

  @Input() compact = false;
  @Input() embedded = false;
  // Color del componente para barras en estado "ok"
  @Input() componentColor: string | null = null;

  @ViewChild('chartRef') chartRef?: UIChart;
  @ViewChild('wrapRef', { static: false }) wrapRef?: ElementRef<HTMLElement>;

  bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  chartData: any;
  chartOptions: any;

  private ro?: ResizeObserver;
  private reinitTimer: any = null;

  constructor(private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stocks'] || changes['thresholds'] || changes['compact'] || changes['embedded'] || changes['componentColor']) {
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
          label: 'Stock (unidades)',
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
          label: 'Umbral mínimo (unidades)',
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
              return `${label}: ${val} unidades`;
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
            callback: (v: number) => `${v} unidades`,
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

    if (!thr || thr <= 0) return this.okColor(0.82);
    if (stock <= thr) return COMPONENT_COLORS.globulos_rojos.backgroundColor;
    if (stock <= thr * 1.3) return 'rgba(249, 115, 22, 0.78)';
    return this.okColor(0.82);
  }

  private getBarBorderColor(type: BloodType): string {
    const stock = Number(this.stocks?.[type] ?? 0);
    const thr = Number(this.thresholds?.[type] ?? 0);

    if (!thr || thr <= 0) return this.okColor(1);
    if (stock <= thr) return COMPONENT_COLORS.globulos_rojos.borderColor;
    if (stock <= thr * 1.3) return 'rgba(234, 88, 12, 1)';
    return this.okColor(1);
  }

  private okColor(alpha: number): string {
    if (this.componentColor) {
      // Parse hex (#rrggbb) to rgba
      const c = this.componentColor.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return alpha < 1 ? 'rgba(56, 189, 248, 0.82)' : 'rgba(2, 132, 199, 1)';
  }
}
