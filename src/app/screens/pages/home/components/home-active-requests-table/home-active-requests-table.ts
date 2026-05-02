import { Component, Input } from '@angular/core';
import { ActiveRequestRow } from '../../home';

@Component({
  selector: 'app-home-active-requests-table',
  standalone: false,
  templateUrl: './home-active-requests-table.html',
  styleUrl: './home-active-requests-table.scss',
})
export class HomeActiveRequestsTableComponent {
  @Input() title = '';
  @Input() rows: ActiveRequestRow[] = [];

  toneForStatus(s: ActiveRequestRow['status']) {
    if (s === 'ACTIVO') return 'info';
    return 'success';
  }

  formatEndDate(r: ActiveRequestRow): string {
    const raw = r.fecha_fin || r.end_date;
    if (!raw) return '—';
    const [y, m, d] = raw.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }
}