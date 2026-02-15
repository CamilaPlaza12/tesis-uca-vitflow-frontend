import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OnboardingRequestsService } from '../../service/onboarding_request_service';

type OnboardingStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
type PendingAction = 'APPROVE' | 'REJECT';

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
  status: OnboardingStatus;
  createdAt: string;
}

@Component({
  selector: 'app-backoffice-requests',
  templateUrl: './backoffice-requests.html',
  styleUrl: './backoffice-requests.scss',
  standalone: false
})
export class BackofficeRequests implements OnInit {

  loading = false;
  loaded = false;
  errorMsg = '';

  requests: HospitalOnboardingRequest[] = [];
  pendingRequests: HospitalOnboardingRequest[] = [];
  selected: HospitalOnboardingRequest | null = null;

  // 🔥 Confirm modal
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Confirmar';
  cancelText = 'Cancelar';
  confirmError: string | null = null;
  private pendingAction: PendingAction | null = null;

  constructor(private onboardingRequestsService: OnboardingRequestsService) {}

  async ngOnInit(): Promise<void> {
    await this.loadRequests();
  }

 async loadRequests(): Promise<void> {
  this.loading = true;
  this.errorMsg = '';

  try {
    const res = await firstValueFrom(
      this.onboardingRequestsService.getOnboardingRequests()
    );

    console.log('RAW RESPONSE:', res);

    this.requests = Array.isArray(res) ? res : [];

    console.log('ANTES DEL FILTER:', this.requests);

    this.pendingRequests = this.requests.filter(r => {
      console.log('STATUS RAW:', r.status);
      return String(r.status).trim().toUpperCase() === 'SUBMITTED';
    });

    console.log('DESPUÉS DEL FILTER:', this.pendingRequests);

  } catch (e) {
    console.error(e);
    this.errorMsg = 'No se pudieron cargar las solicitudes.';
  } finally {
    this.loading = false;
  }
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
  }

  closeDetail(): void {
    this.selected = null;
    this.closeConfirm();
  }

  openApproveConfirm(): void {
    if (!this.selected) return;

    this.pendingAction = 'APPROVE';
    this.confirmTitle = 'Aprobar solicitud';
    this.confirmMessage =
      `Vas a aprobar la solicitud de "${this.selected.hospital.name}".\n\n¿Confirmás?`;

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
      `Vas a rechazar la solicitud de "${this.selected.hospital.name}".\n\n¿Confirmás?`;

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

      await firstValueFrom(
        this.onboardingRequestsService.reviewOnboardingRequest(id, {
          status:
            this.pendingAction === 'APPROVE'
              ? 'APPROVED'
              : 'REJECTED',
          reviewedAt: new Date().toISOString(),
        })
      );

      await this.loadRequests();

      this.confirmOpen = false;
      this.pendingAction = null;
      this.selected = null;

    } catch (e) {
      console.error(e);
      this.confirmError = 'No se pudo completar la acción.';
    } finally {
      this.loading = false;
    }
  }
}
