import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../service/user_service';

type UserRoleLabel = 'Administrador' | 'Técnico';

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  data: any = null;

  editingPhone = false;
  phoneDraft = '';

  logoutOpen = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUserData$.subscribe((data) => {
      this.data = data;
      this.phoneDraft = this.user.phone;
    });
  }

  get user() {
    const u = this.data?.user || {};

    return {
      email: u.email || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      phone: u.phone || '',
      roleLabel: this.getRoleLabel(u.role),
    };
  }

  get hospital() {
    const h = this.data?.hospital || {};
    const address = h.address || {};

    return {
      name: h.name || '',
      subtitle: 'Banco de sangre • Gestión interna',
      email: h.email || '',
      phone: h.phone || '',
      address: this.buildAddress(address),
      verified: true,
    };
  }

  private getRoleLabel(role?: string): UserRoleLabel {
    return role === 'HOSPITAL_ADMIN' ? 'Administrador' : 'Técnico';
  }

  private buildAddress(address: any): string {
    if (!address) return '';

    const parts = [
      [address.street, address.number].filter(Boolean).join(' ').trim(),
      address.localidad || address.locality || '',
      address.city || '',
      address.province || '',
    ].filter(Boolean);

    return parts.join(', ');
  }

  startEditPhone(): void {
    this.editingPhone = true;
    this.phoneDraft = this.user.phone;
  }

  cancelEditPhone(): void {
    this.editingPhone = false;
    this.phoneDraft = this.user.phone;
  }

  savePhone(): void {
    const cleaned = (this.phoneDraft || '').trim();
    this.phoneDraft = cleaned || this.user.phone;
    this.editingPhone = false;
  }

  openLogout(): void {
    this.logoutOpen = true;
  }

  closeLogout(): void {
    this.logoutOpen = false;
  }

  async confirmLogout(): Promise<void> {
    this.logoutOpen = false;
    await this.userService.logout();
  }

}