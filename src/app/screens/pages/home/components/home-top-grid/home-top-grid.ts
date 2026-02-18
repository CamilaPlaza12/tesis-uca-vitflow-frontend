import { Component, EventEmitter, Input, Output } from '@angular/core';

// AJUSTÁ ESTE PATH al real en tu repo
import { BloodType } from '../../../../../models/blood-bank.model';

@Component({
  selector: 'app-home-top-grid',
  standalone: false,
  templateUrl: './home-top-grid.html',
  styleUrl: './home-top-grid.scss',
})
export class HomeTopGridComponent {
  @Input() stocks!: Record<BloodType, number>;
  @Input() thresholds!: Partial<Record<BloodType, number>>;

  @Output() createRequestClick = new EventEmitter<void>();
}
