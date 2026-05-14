import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { HospitalUser, MemberRole, MemberStatus } from '../../../models/hospital-user';
import { EquipoRolesService } from '../../../service/equipos_roles_service';
import { UserService } from '../../../service/user_service';

type ToastKind = 'success' | 'error' | 'info';

@Component({
  selector: 'app-equipo-roles',
  standalone: false,
  templateUrl: './equipos-roles.html',
  styleUrl: './equipos-roles.scss',
})
export class EquipoRoles implements OnInit {
  miembros: HospitalUser[] = [];
  miembroSeleccionado: HospitalUser | null = null;

  cargando = true;

  modalInvitarOpen = false;
  inviteLoading = false;

  selectedInviteRole: MemberRole = 'TECHNICIAN';

  invite_email = '';
  invite_dni = '';
  invite_nombre = '';
  invite_apellido = '';
  invite_phone = '';

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmLoading = false;
  confirmAction: null | (() => void) = null;

  toastOpen = false;
  toastText = '';
  toastKind: ToastKind = 'success';
  private toastTimer: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private equipoRolesService: EquipoRolesService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUserData$
      .pipe(
        filter((data) => data !== null),
        take(1)
      )
      .subscribe((data) => {
        if (data?.user?.role !== 'HOSPITAL_ADMIN') {
          this.router.navigate(['/home']);
          return;
        }
        this.cargarMiembros();
      });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.modalInvitarOpen) this.closeInvitar();
    if (this.confirmOpen) this.closeConfirm();
  }

  private cargarMiembros(): void {
    this.cargando = true;

    this.equipoRolesService.getUsers().subscribe({
      next: (users) => {
        console.log('USERS BACK:', users);
        this.miembros = users || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.showToast(err?.error?.detail || 'No se pudieron cargar los miembros.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  getFullName(u: HospitalUser): string {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || '(Sin nombre)';
  }

  onSelectMiembro(m: HospitalUser): void {
    this.miembroSeleccionado = m;
  }

  onCerrarDetalle(): void {
    this.miembroSeleccionado = null;
  }

  openInvitar(): void {
    this.modalInvitarOpen = true;
  }

  closeInvitar(): void {
    this.modalInvitarOpen = false;
    this.inviteLoading = false;

    this.invite_email = '';
    this.invite_dni = '';
    this.invite_nombre = '';
    this.invite_apellido = '';
    this.invite_phone = '';
    this.selectedInviteRole = 'TECHNICIAN';
  }

  sanitizeDni(event: Event): void {
    const el = event.target as HTMLInputElement;
    const cleaned = el.value.replace(/\D/g, '').slice(0, 8);
    this.invite_dni = cleaned;
    el.value = cleaned;
  }

  sanitizePhone(event: Event): void {
    const el = event.target as HTMLInputElement;
    const cleaned = el.value.replace(/\D/g, '').slice(0, 15);
    this.invite_phone = cleaned;
    el.value = cleaned;
  }

  sanitizeNombre(event: Event): void {
    const el = event.target as HTMLInputElement;
    const cleaned = el.value.replace(/[0-9]/g, '');
    this.invite_nombre = cleaned;
    el.value = cleaned;
  }

  sanitizeApellido(event: Event): void {
    const el = event.target as HTMLInputElement;
    const cleaned = el.value.replace(/[0-9]/g, '');
    this.invite_apellido = cleaned;
    el.value = cleaned;
  }

  get dniError(): string {
    const v = this.invite_dni.trim();
    if (!v) return '';
    if (v.length < 7) return 'Mínimo 7 dígitos.';
    return '';
  }

  get phoneError(): string {
    const v = this.invite_phone.trim();
    if (!v) return '';
    if (v.length < 8) return 'Mínimo 8 dígitos.';
    return '';
  }

  get inviteFormValid(): boolean {
    return !!(
      this.invite_email.trim() &&
      this.invite_dni.trim().length >= 7 &&
      this.invite_nombre.trim() &&
      this.invite_apellido.trim() &&
      this.invite_phone.trim().length >= 8
    );
  }

  submitInvitar(): void {
    const email = this.invite_email.trim();
    const dni = this.invite_dni.trim();
    const firstName = this.invite_nombre.trim();
    const lastName = this.invite_apellido.trim();
    const phone = this.invite_phone.trim();

    if (!this.inviteFormValid) return;
    if (this.inviteLoading) return;

    this.inviteLoading = true;
    this.cdr.detectChanges();

    this.equipoRolesService
      .createTechnician({
        email,
        dni,
        firstName,
        lastName,
        phone,
      })
      .subscribe({
        next: (created) => {
          this.miembros = [created, ...this.miembros];
          this.inviteLoading = false;
          this.showToast('Invitación enviada correctamente.', 'success');
          this.closeInvitar();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.inviteLoading = false;
          this.showToast(err?.error?.detail || 'No se pudo enviar la invitación.', 'error');
          this.cdr.detectChanges();
        },
      });
  }

  onCambiarRol(m: HospitalUser, role: MemberRole): void {
    if (m.role === role) return;
    this.showToast('Por ahora no está habilitado cambiar roles.', 'info');
  }

  onToggleEstado(m: HospitalUser): void {
    if (m.role === 'HOSPITAL_ADMIN') {
      this.showToast('No se puede modificar el estado del administrador.', 'info');
      return;
    }

    const next: MemberStatus = m.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const verb = next === 'SUSPENDED' ? 'suspender' : 'reactivar';

    this.openConfirm(
      'Confirmar acción',
      `Vas a ${verb} el acceso de ${this.getFullName(m)}.`,
      () => {
        this.equipoRolesService.updateUserStatus(m.uid, next).subscribe({
          next: (updated) => {
            this.miembros = this.miembros.map((x) => (x.uid === m.uid ? updated : x));

            if (this.miembroSeleccionado?.uid === m.uid) {
              this.miembroSeleccionado = updated;
            }

            this.closeConfirm();
            this.showToast(`Acceso actualizado: ${this.getFullName(updated)}.`, 'success');
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.confirmLoading = false;
            this.showToast(err?.error?.detail || 'No se pudo actualizar el estado.', 'error');
            this.cdr.detectChanges();
          },
        });
      }
    );
  }

  onReenviarInvitacion(m: HospitalUser): void {
    this.openConfirm(
      'Reenviar invitación',
      `Se reenviará la invitación a ${m.email}.`,
      () => {
        this.equipoRolesService.resendInvitation(m.uid).subscribe({
          next: () => {
            this.closeConfirm();
            this.showToast('Invitación reenviada.', 'success');
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.confirmLoading = false;
            this.showToast(err?.error?.detail || 'No se pudo reenviar la invitación.', 'error');
            this.cdr.detectChanges();
          },
        });
      }
    );
  }

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

    this.confirmAction();
  }

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

  roleLabel(r: MemberRole): string {
    if (r === 'HOSPITAL_ADMIN') return 'Administrador';
    return 'Técnico';
  }

  statusLabel(s: MemberStatus): string {
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