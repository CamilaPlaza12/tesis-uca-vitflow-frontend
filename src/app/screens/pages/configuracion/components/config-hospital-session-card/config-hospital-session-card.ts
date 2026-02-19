import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-config-hospital-session-card',
  standalone: false,
  templateUrl: './config-hospital-session-card.html',
  styleUrl: './config-hospital-session-card.scss',
})
export class ConfigHospitalSessionCard {
  @Input() hospitalName = '';
  @Input() hospitalEmail = '';
  @Input() hospitalPhone = '';
  @Input() addressLine = '';
  @Input() verified = false;

  @Output() logout = new EventEmitter<void>();

  confirmOpen = false;

  openConfirm(): void {
    this.confirmOpen = true;
  }

  cancel(): void {
    this.confirmOpen = false;
  }

  confirm(): void {
    this.confirmOpen = false;
    this.logout.emit();
  }
}
