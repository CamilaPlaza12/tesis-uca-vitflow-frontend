import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-availability-modal',
  standalone: false,
  templateUrl: './availability-modal.html',
  styleUrl: './availability-modal.scss',
})
export class AvailabilityModal implements OnChanges {
  @Input() open = false;

  @Output() configureNow = new EventEmitter<void>();
  @Output() continueLater = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) document.body.classList.add('modal-open');
      else document.body.classList.remove('modal-open');
    }
  }

  onOverlayClick(): void {
    this.close.emit();
  }

  stop(e: MouseEvent): void {
    e.stopPropagation();
  }

  onConfigureNow(): void {
    this.configureNow.emit();
  }

  onContinueLater(): void {
    this.continueLater.emit();
  }

  onCancel(): void {
    this.close.emit();
  }
}
