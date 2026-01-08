import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-availability-empty-state',
  standalone: false,
  templateUrl: './availability-empty-state.html',
  styleUrl: './availability-empty-state.scss',
})
export class AvailabilityEmptyState {
  @Input() open = false;
  @Output() configure = new EventEmitter<void>();

  onClick(): void {
    this.configure.emit();
  }
}
