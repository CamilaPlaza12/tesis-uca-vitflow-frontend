import { Component, Input } from '@angular/core';
import { DonationAppointmentRow } from '../../home';

@Component({
  selector: 'app-home-donation-appointments-table',
  standalone: false,
  templateUrl: './home-donation-appointments-table.html',
  styleUrl: './home-donation-appointments-table.scss',
})
export class HomeDonationAppointmentsTableComponent {
  @Input() title = '';
  @Input() rows: DonationAppointmentRow[] = [];

  toneForStatus(status: DonationAppointmentRow['status']) {
    switch (status) {
      case 'CONFIRMADO':
      case 'COMPLETADO':
        return 'success';

      case 'PROGRAMADO':
        return 'warning';

      case 'CANCELADO':
      case 'NO_PRESENTADO':
        return 'danger';

      default:
        return 'neutral';
    }
  }
}