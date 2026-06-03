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

  formatAppointmentDate(date_local: string | undefined): string {
    if (!date_local) return '';
    // accepts "dd/mm/yyyy" or "yyyy-mm-dd"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date_local)) {
      return date_local; // already DD/MM/YYYY
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date_local)) {
      const [y, m, d] = date_local.split('-');
      return `${d}/${m}/${y}`;
    }
    return date_local;
  }

  toneForStatus(status: DonationAppointmentRow['status']) {
    switch (status) {
      case 'CONFIRMADO':
      case 'COMPLETADO':
        return 'success';
      case 'PROGRAMADO':
        return 'warning';
      case 'PENDIENTE_CLASIFICACION':
        return 'info';
      case 'CANCELADO':
        return 'danger';
      case 'NO_PRESENTADO':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}
