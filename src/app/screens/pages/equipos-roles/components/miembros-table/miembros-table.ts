import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HospitalUser } from '../../../../../models/hospital-user';

type MemberRole = HospitalUser['role'];

@Component({
  selector: 'app-miembros-table',
  standalone: false,
  templateUrl: './miembros-table.html',
  styleUrl: './miembros-table.scss',
})
export class MiembrosTable {
  @Input() miembros: HospitalUser[] = [];
  @Input() miembroSeleccionadoId: string | null = null;
  @Input() cargando = false;

  @Output() selectMiembro = new EventEmitter<HospitalUser>();
  @Output() cambiarRol = new EventEmitter<{ miembro: HospitalUser; role: MemberRole }>();
  @Output() toggleEstado = new EventEmitter<HospitalUser>();
  @Output() reenviarInvitacion = new EventEmitter<HospitalUser>();

  roleOpenId: string | null = null;

  onRowClick(m: HospitalUser): void {
    this.selectMiembro.emit(m);
  }

  toggleRoleMenu(m: HospitalUser): void {
    this.roleOpenId = this.roleOpenId === m.uid ? null : m.uid;
  }

  closeRoleMenu(): void {
    this.roleOpenId = null;
  }

  setRole(m: HospitalUser, role: MemberRole): void {
    this.cambiarRol.emit({ miembro: m, role });
    this.roleOpenId = null;
  }

  getFullName(u: HospitalUser): string {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || '(Sin nombre)';
  }

  roleLabel(r: MemberRole): string {
    if (r === 'HOSPITAL_ADMIN') return 'Administrador';
    return 'Técnico';
  }

  statusLabel(s: HospitalUser['status']): string {
    if (s === 'ACTIVE') return 'Activo';
    if (s === 'INVITED') return 'Invitado';
    return 'Suspendido';
  }

  formatFechaHora(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} · ${hh}:${min}`;
  }
}