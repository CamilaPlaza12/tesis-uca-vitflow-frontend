import { Component } from '@angular/core';

type UserRoleLabel = 'Administrador' | 'Empleado';

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion {
  // =========================
  // Hardcode (por ahora)
  // =========================
  user = {
    email: 'admin.donaciones@hospitalcentral.gob.ar',
    firstName: 'Martina',
    lastName: 'Heine',
    phone: '+54 11 4567-8899',
    roleLabel: 'Administrador' as UserRoleLabel,
  };

  hospital = {
    name: 'Hospital Central de CABA',
    subtitle: 'Banco de sangre • Gestión interna',
    email: 'bancosangre@hospitalcentral.gob.ar',
    phone: '+54 11 4382-1100',
    address: 'Av. Corrientes 2389, Almagro, Ciudad Autónoma de Buenos Aires',
    verified: true,
  };

  // =========================
  // UI state
  // =========================
  editingPhone = false;
  phoneDraft = this.user.phone;

  // Avatar (preview local)
  avatarUrl: string | null = null; // si querés default: poné una URL o dejalo null

  // Preferencias
  prefs = {
    emailAlerts: true,
    urgentOnly: false,
    compactUI: false,
  };

  // Modal cerrar sesión
  logoutOpen = false;

  // =========================
  // Actions
  // =========================
  startEditPhone(): void {
    this.editingPhone = true;
    this.phoneDraft = this.user.phone;
  }

  cancelEditPhone(): void {
    this.editingPhone = false;
    this.phoneDraft = this.user.phone;
  }

  savePhone(): void {
    // ✅ por ahora solo actualizamos hardcode.
    // después acá llamás al backend.
    const cleaned = (this.phoneDraft || '').trim();
    this.user.phone = cleaned || this.user.phone;
    this.editingPhone = false;
  }

  openLogout(): void {
    this.logoutOpen = true;
  }

  closeLogout(): void {
    this.logoutOpen = false;
  }

  confirmLogout(): void {
    this.logoutOpen = false;

    // TODO: acá conectás tu logout real
    // this.authService.logout();
    // this.router.navigate(['/login']);
    console.log('Logout confirmado (conectar auth real).');
  }

  onAvatarFilePicked(ev: Event): void {
    const input = ev.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    // simple validación
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);

    // reset para permitir re-subir el mismo archivo
    if (input) input.value = '';
  }

  getInitials(): string {
    const a = (this.user.firstName || '').trim();
    const b = (this.user.lastName || '').trim();
    const one = a ? a[0] : 'U';
    const two = b ? b[0] : '';
    return (one + two).toUpperCase();
  }
}
