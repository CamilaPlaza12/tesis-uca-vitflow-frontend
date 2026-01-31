import { Component } from '@angular/core';

type PlanId = 0 | 1;
type OnboardingStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

interface HospitalOnboardingRequest {
  id: string;
  admin: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dni: string;
  };
  hospital: {
    name: string;
    email: string;
    phone: string;
    address: {
      street?: string;
      number?: string;
      city?: string;
      localidad?: string;
      province?: string;
      provinceId?: string;
      localidadId?: string;
    };
  };
  plan: { planId: PlanId };
  status: OnboardingStatus;
  createdAt: string;
}

type PendingAction = 'APPROVE' | 'REJECT';

@Component({
  selector: 'app-backoffice-requests',
  standalone: false,
  templateUrl: './backoffice-requests.html',
  styleUrl: './backoffice-requests.scss',
})
export class BackofficeRequests {
  loading = false;
  errorMsg = '';

  // ✅ Confirm modal (genérico)
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Confirmar';
  cancelText = 'Cancelar';
  confirmError: string | null = null;

  private pendingAction: PendingAction | null = null;

  // ✅ Mock data
  requests: HospitalOnboardingRequest[] = [
    {
      id: 'req_001',
      admin: {
        email: 'camila.test@hospital.com',
        firstName: 'Camila',
        lastName: 'Testeando',
        phone: '+54 11 3281 1555',
        dni: '12345678',
      },
      hospital: {
        name: 'Hospital Test',
        email: 'contacto@hospitaltest.com',
        phone: '1133344455',
        address: {
          street: 'Av Santa Fe',
          number: '1234',
          city: 'CABA',
          localidad: 'Recoleta',
          province: 'Buenos Aires',
          provinceId: '06',
          localidadId: '0607',
        },
      },
      plan: { planId: 1 },
      status: 'SUBMITTED',
      createdAt: '2026-01-31T15:38:56.030Z',
    },
    {
      id: 'req_002',
      admin: {
        email: 'admin@clinicax.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+54 11 4444 2222',
        dni: '33445566',
      },
      hospital: {
        name: 'Clínica X',
        email: 'info@clinicax.com',
        phone: '1140099911',
        address: {
          street: 'Av Cabildo',
          number: '999',
          city: 'CABA',
          localidad: 'Belgrano',
          province: 'Buenos Aires',
          provinceId: '06',
          localidadId: '0612',
        },
      },
      plan: { planId: 0 },
      status: 'SUBMITTED',
      createdAt: '2026-01-30T11:10:00.000Z',
    },
  ];

  selected: HospitalOnboardingRequest | null = null;

  get pendingRequests(): HospitalOnboardingRequest[] {
    return this.requests
      .filter(r => r.status === 'SUBMITTED')
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  planLabel(planId: PlanId): string {
    return planId === 1 ? 'Pro' : 'Free';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }

  fullAddress(r: HospitalOnboardingRequest): string {
    const a = r.hospital.address || {};
    const street = [a.street, a.number].filter(Boolean).join(' ');
    const place = [a.city, a.localidad, a.province].filter(Boolean).join(', ');
    if (!street && !place) return '—';
    if (!street) return place;
    if (!place) return street;
    return `${street}, ${place}`;
  }

  openDetail(r: HospitalOnboardingRequest): void {
    this.selected = r;
    this.errorMsg = '';
  }

  closeDetail(): void {
    this.selected = null;
    this.closeConfirm();
  }

  // ===== Confirm modal handlers =====
  openApproveConfirm(): void {
    if (!this.selected) return;

    this.pendingAction = 'APPROVE';
    this.confirmTitle = 'Aprobar solicitud';
    this.confirmMessage =
      `Vas a aprobar la solicitud de "${this.selected.hospital.name}". ` +
      `Esto habilita el alta institucional y el acceso del administrador.\n\n¿Confirmás?`;
    this.confirmText = 'Aprobar';
    this.cancelText = 'Cancelar';
    this.confirmError = null;
    this.confirmOpen = true;
  }

  openRejectConfirm(): void {
    if (!this.selected) return;

    this.pendingAction = 'REJECT';
    this.confirmTitle = 'Rechazar solicitud';
    this.confirmMessage =
      `Vas a rechazar la solicitud de "${this.selected.hospital.name}". ` +
      `El administrador no podrá continuar con el alta.\n\n¿Confirmás?`;
    this.confirmText = 'Rechazar';
    this.cancelText = 'Volver';
    this.confirmError = null;
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    if (this.loading) return;
    this.confirmOpen = false;
    this.pendingAction = null;
    this.confirmError = null;
  }

  async onConfirmAction(): Promise<void> {
    if (!this.selected || !this.pendingAction) return;

    this.loading = true;
    this.confirmError = null;

    try {
      const id = this.selected.id;

      if (this.pendingAction === 'APPROVE') {
        // TODO: reemplazar por llamada real (Vicky)
        // await this.backofficeService.approveRequest(id);

        // mock
        this.selected.status = 'APPROVED';
      }

      if (this.pendingAction === 'REJECT') {
        // TODO: reemplazar por llamada real (Vicky)
        // await this.backofficeService.rejectRequest(id);

        // mock
        this.selected.status = 'REJECTED';
      }

      // cerramos todo
      this.confirmOpen = false;
      this.pendingAction = null;
      this.selected = null;
    } catch (e: any) {
      this.confirmError = 'No se pudo completar la acción. Probá de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
