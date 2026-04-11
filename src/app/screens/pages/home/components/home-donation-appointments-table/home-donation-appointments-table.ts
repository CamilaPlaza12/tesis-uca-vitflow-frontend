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

  private readonly today = new Date();

  dayLabel(dateLocal: string | undefined): 'hoy' | 'manana' | null {
    if (!dateLocal) return null;

    const normalize = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const todayStr = normalize(this.today);

    const tomorrow = new Date(this.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = normalize(tomorrow);

    // dateLocal may come as "dd/mm/yyyy" or "yyyy-mm-dd"
    let normalized = dateLocal;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateLocal)) {
      const [d, m, y] = dateLocal.split('/');
      normalized = `${y}-${m}-${d}`;
    }

    if (normalized === todayStr) return 'hoy';
    if (normalized === tomorrowStr) return 'manana';
    return null;
  }

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
