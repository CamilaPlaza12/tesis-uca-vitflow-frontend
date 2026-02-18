import { Component } from '@angular/core';

export type UserRole = 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF';

export interface ConfigUser {
  uid: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  hospitalId: string;
}

export interface HospitalAddress {
  street: string;
  number: string;
  localidad: string;
  localidadId: string;
  city: string;
  province: string;
  provinceId: string;
}

export interface ConfigHospital {
  createdAt: string;
  createdFromRequestId: string;
  email: string;
  name: string;
  phone: string;
  address: HospitalAddress;
}

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion {
  user: ConfigUser = {
    createdAt: '2026-02-14T04:58:35.791063',
    email: 'marcheine@uca.edu.ar',
    firstName: 'hssdf',
    hospitalId: 'JziLomXiK04btfsNMqAE',
    lastName: 'sdfs',
    phone: '276837684',
    role: 'HOSPITAL_ADMIN',
    uid: 'eDwRZgdUaoai6jzA19jPYr0s6Pt2',
  };

  hospital: ConfigHospital = {
    createdAt: '2026-02-14T04:58:33.668595',
    createdFromRequestId: 'Nrdtuo7R2ePdWp8b8jTb',
    email: 'mvheine42@gmail.com',
    name: 'hola',
    phone: '23987782934',
    address: {
      city: 'askld',
      localidad: 'Almagro',
      localidadId: '0203501001',
      number: '2389',
      province: 'Ciudad Autónoma de Buenos Aires',
      provinceId: '02',
      street: 'iosdsd',
    },
  };

  // UI state
  savingProfile = false;
  profileOk = false;
  profileError = '';

  changingPassword = false;
  passOk = false;
  passError = '';

  roleLabel(role: UserRole): string {
    return role === 'HOSPITAL_ADMIN' ? 'Administrador del hospital' : 'Personal del hospital';
  }

  addressLine(): string {
    const a = this.hospital.address;
    return `${a.street} ${a.number}, ${a.localidad} (${a.province})`;
  }

  onSaveProfile(updated: { firstName: string; lastName: string; phone: string }): void {
    this.profileOk = false;
    this.profileError = '';
    this.savingProfile = true;

    setTimeout(() => {
      this.user = { ...this.user, ...updated };
      this.savingProfile = false;
      this.profileOk = true;
      setTimeout(() => (this.profileOk = false), 1600);
    }, 600);
  }

  onChangePassword(payload: { current: string; next: string; confirm: string }): void {
    this.passOk = false;
    this.passError = '';
    this.changingPassword = true;

    setTimeout(() => {
      if (!payload.current || !payload.next || !payload.confirm) {
        this.passError = 'Completá todos los campos.';
        this.changingPassword = false;
        return;
      }
      if (payload.next.length < 8) {
        this.passError = 'La nueva contraseña debe tener al menos 8 caracteres.';
        this.changingPassword = false;
        return;
      }
      if (payload.next !== payload.confirm) {
        this.passError = 'La confirmación no coincide.';
        this.changingPassword = false;
        return;
      }

      this.passOk = true;
      this.changingPassword = false;
      setTimeout(() => (this.passOk = false), 1600);
    }, 650);
  }

  onLogout(): void {
    console.log('logout');
  }
}
