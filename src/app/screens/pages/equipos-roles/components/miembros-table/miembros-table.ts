import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HospitalMember } from '../../equipos-roles';

type MemberRole = HospitalMember['role'];

@Component({
  selector: 'app-miembros-table',
  standalone: false,
  templateUrl: './miembros-table.html',
  styleUrl: './miembros-table.scss',
})
export class MiembrosTable {
   @Input() miembros: HospitalMember[] = [];
  @Input() miembroSeleccionadoId: string | null = null;
  @Input() cargando = false;

  @Output() selectMiembro = new EventEmitter<HospitalMember>();
  @Output() cambiarRol = new EventEmitter<{ miembro: HospitalMember; role: MemberRole }>();
  @Output() toggleEstado = new EventEmitter<HospitalMember>();
  @Output() reenviarInvitacion = new EventEmitter<HospitalMember>();

  // dropdown abierto por id
  roleOpenId: string | null = null;

  onRowClick(m: HospitalMember): void {
    this.selectMiembro.emit(m);
  }

  toggleRoleMenu(m: HospitalMember): void {
    this.roleOpenId = this.roleOpenId === m.id ? null : m.id;
  }

  closeRoleMenu(): void {
    this.roleOpenId = null;
  }

  setRole(m: HospitalMember, role: MemberRole): void {
    this.cambiarRol.emit({ miembro: m, role });
    this.roleOpenId = null;
  }

  roleLabel(r: MemberRole): string {
    if (r === 'ADMIN') return 'Administrador';
    if (r === 'OPERADOR') return 'Operador';
    return 'Lectura';
  }

  statusLabel(s: HospitalMember['status']): string {
    if (s === 'ACTIVE') return 'Activo';
    if (s === 'INVITED') return 'Invitado';
    return 'Suspendido';
  }

  formatFechaHora(iso: string): string {
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
