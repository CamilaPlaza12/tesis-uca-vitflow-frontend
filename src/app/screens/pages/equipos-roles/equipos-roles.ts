import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';

type MemberRole = 'ADMIN' | 'OPERADOR' | 'LECTURA';
type MemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

export interface HospitalMember {
  id: string;
  full_name: string;
  email: string;
  dni: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string; // ISO
}

type ToastKind = 'success' | 'error' | 'info';


@Component({
  selector: 'app-equipo-roles',
  standalone: false,
  templateUrl: './equipos-roles.html',
  styleUrl: './equipos-roles.scss',
})
export class EquipoRoles implements OnInit {
  miembros: HospitalMember[] = [];
  miembroSeleccionado: HospitalMember | null = null;

  cargando = true;

  // UI state
  modalInvitarOpen = false;
  inviteLoading = false;

  // Dropdowns
  inviteRoleOpen = false;
  selectedInviteRole: MemberRole = 'OPERADOR';

  // Form invitar
  invite_email = '';
  invite_dni = '';
  invite_nombre = '';

  // Confirm modal (para suspender/reactivar y reenviar)
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmLoading = false;
  confirmAction: null | (() => void) = null;

  // Toast
  toastOpen = false;
  toastText = '';
  toastKind: ToastKind = 'success';
  private toastTimer: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.modalInvitarOpen) this.closeInvitar();
    if (this.confirmOpen) this.closeConfirm();
    // Los dropdown se cierran con click afuera (se maneja en html)
  }

  private cargarMiembros(): void {
    this.cargando = true;

    setTimeout(() => {
      this.miembros = [
        {
          id: 'm1',
          full_name: 'Camila Plaza',
          email: 'cami@vitflow.com',
          dni: '40.123.456',
          role: 'ADMIN',
          status: 'ACTIVE',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        },
        {
          id: 'm2',
          full_name: 'Sofía González',
          email: 'sofi@vitflow.com',
          dni: '41.987.321',
          role: 'OPERADOR',
          status: 'ACTIVE',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
        {
          id: 'm3',
          full_name: 'Nicolás Pérez',
          email: 'nico@vitflow.com',
          dni: '39.555.222',
          role: 'LECTURA',
          status: 'INVITED',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: 'm4',
          full_name: 'María López',
          email: 'maria@vitflow.com',
          dni: '38.111.999',
          role: 'OPERADOR',
          status: 'SUSPENDED',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 65).toISOString(),
        },
      ];

      this.cargando = false;
      this.cdr.detectChanges();
    }, 450);
  }

  // ===== UI =====

  onSelectMiembro(m: HospitalMember): void {
    this.miembroSeleccionado = m;
  }

  onCerrarDetalle(): void {
    this.miembroSeleccionado = null;
  }

  openInvitar(): void {
    this.modalInvitarOpen = true;
    this.inviteRoleOpen = false;
  }

  closeInvitar(): void {
    this.modalInvitarOpen = false;
    this.inviteLoading = false;
    this.inviteRoleOpen = false;

    this.invite_email = '';
    this.invite_dni = '';
    this.invite_nombre = '';
    this.selectedInviteRole = 'OPERADOR';
  }

  toggleInviteRoleOpen(): void {
    this.inviteRoleOpen = !this.inviteRoleOpen;
  }

  setInviteRole(role: MemberRole): void {
    this.selectedInviteRole = role;
    this.inviteRoleOpen = false;
  }

  submitInvitar(): void {
    const email = this.invite_email.trim();
    const dni = this.invite_dni.trim();
    const nombre = this.invite_nombre.trim();

    if (!email || !dni) return;
    if (this.inviteLoading) return;

    this.inviteLoading = true;
    this.cdr.detectChanges();

    // Simula backend real time
    setTimeout(() => {
      const nuevo: HospitalMember = {
        id: 'm_' + Math.random().toString(16).slice(2),
        full_name: nombre || '(Sin nombre)',
        email,
        dni,
        role: this.selectedInviteRole,
        status: 'INVITED',
        created_at: new Date().toISOString(),
      };

      this.miembros = [nuevo, ...this.miembros];
      this.inviteLoading = false;

      this.showToast('Invitación enviada correctamente.', 'success');
      this.closeInvitar();
      this.cdr.detectChanges();
    }, 700);
  }

  // ===== Actions (desde tabla) =====

  onCambiarRol(m: HospitalMember, role: MemberRole): void {
    if (m.role === role) return;

    // En este caso NO confirmo, porque cambiar rol es algo “rápido” tipo dropdown.
    // Si querés confirmación después la sumamos.
    this.miembros = this.miembros.map(x => (x.id === m.id ? { ...x, role } : x));
    if (this.miembroSeleccionado?.id === m.id) {
      this.miembroSeleccionado = { ...this.miembroSeleccionado, role };
    }

    this.showToast(`Rol actualizado: ${m.full_name} → ${this.roleLabel(role)}.`, 'info');
    this.cdr.detectChanges();
  }

  onToggleEstado(m: HospitalMember): void {
    const next: MemberStatus = m.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const verb = next === 'SUSPENDED' ? 'suspender' : 'reactivar';

    this.openConfirm(
      'Confirmar acción',
      `Vas a ${verb} el acceso de ${m.full_name}.`,
      () => {
        this.miembros = this.miembros.map(x => (x.id === m.id ? { ...x, status: next } : x));
        if (this.miembroSeleccionado?.id === m.id) {
          this.miembroSeleccionado = { ...this.miembroSeleccionado, status: next };
        }
        this.closeConfirm();
        this.showToast(`Acceso actualizado: ${m.full_name}.`, 'success');
        this.cdr.detectChanges();
      }
    );
  }

  onReenviarInvitacion(m: HospitalMember): void {
    this.openConfirm(
      'Reenviar invitación',
      `Se reenviará la invitación a ${m.email}.`,
      () => {
        // Simula request
        setTimeout(() => {
          this.closeConfirm();
          this.showToast('Invitación reenviada.', 'success');
          this.cdr.detectChanges();
        }, 350);
      }
    );
  }

  // ===== Confirm modal =====

  private openConfirm(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    this.confirmOpen = false;
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmLoading = false;
    this.confirmAction = null;
  }

  confirmDo(): void {
    if (!this.confirmAction) return;
    if (this.confirmLoading) return;

    this.confirmLoading = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.confirmAction?.();
      this.confirmLoading = false;
      this.cdr.detectChanges();
    }, 250);
  }

  // ===== Toast =====

  private showToast(text: string, kind: ToastKind): void {
    this.toastText = text;
    this.toastKind = kind;
    this.toastOpen = true;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastOpen = false;
      this.cdr.detectChanges();
    }, 2600);
  }

  closeToast(): void {
    this.toastOpen = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ===== Labels / utils =====

  roleLabel(r: MemberRole): string {
    if (r === 'ADMIN') return 'Administrador';
    if (r === 'OPERADOR') return 'Operador';
    return 'Lectura';
  }

  statusLabel(s: MemberStatus): string {
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
