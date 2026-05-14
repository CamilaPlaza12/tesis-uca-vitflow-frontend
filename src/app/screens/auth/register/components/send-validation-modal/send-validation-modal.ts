import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-send-validation-modal',
  standalone: false,
  templateUrl: './send-validation-modal.html',
  styleUrl: './send-validation-modal.scss',
})
export class SendValidationModal {
  @Input() open = false;
  @Input() adminEmail = '';
  @Input() loading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdropClick(ev: MouseEvent): void {
    // Si clickean el backdrop (no el modal), cerramos
    if ((ev.target as HTMLElement)?.classList?.contains('vf-modal-backdrop')) {
      this.cancel.emit();
    }
  }
}
