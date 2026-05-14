import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home-kpis',
  standalone: false,
  templateUrl: './home-kpis.html',
  styleUrl: './home-kpis.scss',
})
export class HomeKpisComponent {
  @Input() totalUnits = 0;
  @Input() appointmentsToday = 0;

  // opcional, el extra “críticos”
  @Input() criticalGroupsCount: number | null = null;
}
