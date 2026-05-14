import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turno } from '../../../../../models/turno';
import {
  AccionTurno,
  canCancel,
  canClasificar,
  canConfirm,
  canMarkCompleted,
  canMarkNoShow,
  canReprogram,
} from '../../turno-actions.policy';

@Component({
  selector: 'app-turno-detail',
  standalone: false,
  templateUrl: './turno-detail.html',
  styleUrl: './turno-detail.scss',
})
export class TurnoDetail {
  @Input() turno!: Turno;

  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<AccionTurno>();

  canConfirm(): boolean {
    return canConfirm(this.turno);
  }

  canReprogram(): boolean {
    return canReprogram(this.turno);
  }

  canCancel(): boolean {
    return canCancel(this.turno);
  }

  canMarkCompleted(): boolean {
    return canMarkCompleted(this.turno);
  }

  canMarkNoShow(): boolean {
    return canMarkNoShow(this.turno);
  }

  canClasificar(): boolean {
    return canClasificar(this.turno);
  }

  statusLabel(): string {
    const labels: Record<string, string> = {
      PROGRAMADO: 'Programado',
      CONFIRMADO: 'Confirmado',
      COMPLETADO: 'Completado',
      CANCELADO: 'Cancelado',
      NO_PRESENTADO: 'No se presentó',
      PENDIENTE_CLASIFICACION: 'Pendiente de clasificación',
    };
    return labels[this.turno.status] ?? this.turno.status;
  }

  emitAction(a: AccionTurno): void {
    this.action.emit(a);
  }
}
