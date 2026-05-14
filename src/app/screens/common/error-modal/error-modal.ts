import { Component, EventEmitter, Input, Output } from '@angular/core';

type ModalKind = 'error' | 'success' | 'info' | 'warning';


@Component({
  selector: 'app-error-modal',
  standalone: false,
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.scss',
})

export class ErrorModal {
  @Input() open = false;
  @Input() title = 'Aviso';
  @Input() message = '';
  @Input() kind: ModalKind = 'info';
  @Input() confirmText = 'Cerrar';

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  // Para cerrar clickeando fuera
  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('vf-modal-backdrop')) {
      this.close();
    }
  }
}
