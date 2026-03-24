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

  toneForPriority(p: ActiveRequestRow['priority']) {
    if (p === 'URGENTE' || p === 'CRITICA') return 'danger';
    return 'neutral';
  }

  toneForStatus(s: ActiveRequestRow['status']) {
    if (s === 'ACTIVO') return 'info';
    return 'success';
  }
}