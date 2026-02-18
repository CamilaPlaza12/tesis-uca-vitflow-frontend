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
    if (status === 'Confirmado') return 'success';
    if (status === 'Pendiente') return 'warning';
    return 'danger';
  }
}
