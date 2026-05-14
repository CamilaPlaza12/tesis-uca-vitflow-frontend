import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: false,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal implements OnChanges {
  @Input() open = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() loading = false;
  @Input() error: string | null = null;

  @Input() reprogram = false;
  @Input() reprogramDate = '';
  @Input() reprogramTime = '';
  @Input() reprogramMinDate = '';
  @Input() reprogramAvailableDates: string[] = [];
  @Input() reprogramAvailableTimes: string[] = [];

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // ✅ NUEVO: emitir cambios hacia el padre
  @Output() reprogramDateChange = new EventEmitter<string>();
  @Output() reprogramTimeChange = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) document.body.classList.add('modal-open');
      else document.body.classList.remove('modal-open');
    }
  }

  onOverlayClick(): void {
    if (this.loading) return;
    this.cancel.emit();
  }

  stop(e: MouseEvent): void {
    e.stopPropagation();
  }

  onConfirm(): void {
    if (this.loading) return;
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.loading) return;
    this.cancel.emit();
  }

  onReprogramDateInput(v: string): void {
    this.reprogramDate = v;
    this.reprogramDateChange.emit(v);
  }

  onReprogramTimeInput(v: string): void {
    this.reprogramTime = v;
    this.reprogramTimeChange.emit(v);
  }

  formatDateLabel(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const date = new Date(+y, +m - 1, +d);
    return date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }
}
