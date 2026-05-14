import { Component, Input } from '@angular/core';

type PillTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

@Component({
  selector: 'app-pill-badge',
  standalone: false,
  templateUrl: './pill-badge.html',
  styleUrl: './pill-badge.scss',
})
export class PillBadgeComponent {
  @Input() text = '';
  @Input() tone: PillTone = 'neutral';
}
