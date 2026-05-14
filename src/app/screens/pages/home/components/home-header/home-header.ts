import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-home-header',
  standalone: false,
  templateUrl: './home-header.html',
  styleUrl: './home-header.scss',
})
export class HomeHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() dateLabel = '';
  @Input() unreadNotifications = 0;

  @Output() notificationsClick = new EventEmitter<void>();
}
