import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-availability-empty-state',
  standalone: false,
  templateUrl: './availability-empty-state.html',
  styleUrl: './availability-empty-state.scss',
})
export class AvailabilityEmptyState {
  @Input() open = false;
  @Input() readOnly = false;
  @Output() configure = new EventEmitter<void>();

  onClick(): void {
    if (!this.readOnly) this.configure.emit();
  }
}
