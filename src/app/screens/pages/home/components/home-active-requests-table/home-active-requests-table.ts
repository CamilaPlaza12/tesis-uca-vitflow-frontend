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
    return p === 'Urgente' ? 'danger' : 'neutral';
  }

  toneForStatus(s: ActiveRequestRow['status']) {
    return s === 'Activo' ? 'info' : 'success';
  }
}
