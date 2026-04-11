import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BloodType, ResumenDashboard } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-home-top-grid',
  standalone: false,
  templateUrl: './home-top-grid.html',
  styleUrl: './home-top-grid.scss',
})
export class HomeTopGridComponent {
  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;
  @Input() stockDashboard: ResumenDashboard | null = null;
  @Input() stockDashboardLoading = false;

  @Output() createRequestClick = new EventEmitter<void>();
}
