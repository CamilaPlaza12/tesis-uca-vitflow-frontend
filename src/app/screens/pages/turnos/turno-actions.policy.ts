import { Turno } from '../../../models/turno';

const MIN_CANCEL_MINUTES = 30;
const MAX_ACTION_WINDOW_HOURS = 24;

export type AccionTurno =
  | 'CONFIRMAR'
  | 'REPROGRAMAR'
  | 'CANCELAR'
  | 'COMPLETAR'
  | 'CLASIFICAR'
  | 'NO_PRESENTADO';

function getTurnoDateTime(turno: Turno): Date {
  // ✅ alineado al back
  return new Date(`${turno.date_local}T${turno.time_local}`);
}

function minutesUntilTurno(turno: Turno): number {
  const now = new Date().getTime();
  const turnoTime = getTurnoDateTime(turno).getTime();
  return Math.floor((turnoTime - now) / 60000);
}

function withinActionWindow(turno: Turno): boolean {
  const now = new Date().getTime();
  const turnoTime = getTurnoDateTime(turno).getTime();
  const max = turnoTime + MAX_ACTION_WINDOW_HOURS * 3600000;
  return now >= turnoTime && now <= max;
}

export function canConfirm(turno: Turno): boolean {
  // ✅ estado -> status
  return turno.status === 'PROGRAMADO' && minutesUntilTurno(turno) > 0;
}

export function canReprogram(turno: Turno): boolean {
  // ✅ estado -> status
  if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.status)) return false;
  return minutesUntilTurno(turno) >= MIN_CANCEL_MINUTES;
}

export function canCancel(turno: Turno): boolean {
  // ✅ estado -> status
  if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.status)) return false;
  return minutesUntilTurno(turno) >= MIN_CANCEL_MINUTES;
}

export function canMarkCompleted(turno: Turno): boolean {
  if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.status)) return false;
  // Permitir carga operativa tardía: cualquier turno pasado puede marcarse como asistido
  return getTurnoDateTime(turno).getTime() <= new Date().getTime();
}

export function canMarkNoShow(turno: Turno): boolean {
  if (!['PROGRAMADO', 'CONFIRMADO'].includes(turno.status)) return false;
  return getTurnoDateTime(turno).getTime() <= new Date().getTime();
}

export function canClasificar(turno: Turno): boolean {
  return turno.status === 'PENDIENTE_CLASIFICACION';
}
