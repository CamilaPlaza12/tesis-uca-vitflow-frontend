import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OnboardingRequestsService } from '../../service/onboarding_request_service';
import { AdminJobsService } from '../../service/admin_jobs_service';
import { ChangeDetectorRef, NgZone } from '@angular/core';

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
      street: string;
      number: string;
      city: string;
      localidad: string;
      province: string;
      provinceId: string;
      localidadId: string;
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
  accessDenied = false;

  // Jobs
  jobConfirmOpen = false;
  jobConfirmTitle = '';
  jobConfirmMessage = '';
  jobLoading = false;
  jobResultMsg = '';
  jobError = '';
  private pendingJob: 'finalizar' | 'no-presentados' | null = null;

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

  constructor(
    private onboardingRequestsService: OnboardingRequestsService,
    private adminJobsService: AdminJobsService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

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

    this.zone.run(() => {
      this.requests = Array.isArray(res) ? res : [];
      this.pendingRequests = this.requests.filter(
        r => String(r.status).trim().toUpperCase() === 'SUBMITTED'
      );
      this.loading = false;

      // 🔥 fuerza render inmediato
      this.cdr.detectChanges();
    });

  } catch (e: any) {
    this.zone.run(() => {
      if (e?.status === 403) {
        this.accessDenied = true;
      } else {
        this.errorMsg = 'No se pudieron cargar las solicitudes.';
      }
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}

  openJobConfirm(job: 'finalizar' | 'no-presentados'): void {
    this.pendingJob = job;
    this.jobResultMsg = '';
    this.jobError = '';
    if (job === 'finalizar') {
      this.jobConfirmTitle = 'Finalizar pedidos vencidos';
      this.jobConfirmMessage = '¿Confirmás que querés finalizar todos los pedidos vencidos?';
    } else {
      this.jobConfirmTitle = 'Marcar turnos no presentados';
      this.jobConfirmMessage = '¿Confirmás que querés marcar como "No se presentó" todos los turnos vencidos?';
    }
    this.jobConfirmOpen = true;
  }

  closeJobConfirm(): void {
    if (this.jobLoading) return;
    this.jobConfirmOpen = false;
    this.pendingJob = null;
  }

  async onConfirmJob(): Promise<void> {
    if (!this.pendingJob || this.jobLoading) return;
    this.jobLoading = true;
    this.jobError = '';

    try {
      const obs = this.pendingJob === 'finalizar'
        ? this.adminJobsService.finalizarPedidosVencidos()
        : this.adminJobsService.marcarNoPresentes();

      const result = await firstValueFrom(obs);
      const n = result?.updated ?? 0;

      this.zone.run(() => {
        this.jobConfirmOpen = false;
        this.pendingJob = null;
        this.jobResultMsg = `Operación completada. ${n} registro${n !== 1 ? 's' : ''} actualizado${n !== 1 ? 's' : ''}.`;
        this.jobLoading = false;
        this.cdr.detectChanges();
      });
    } catch (e: any) {
      this.zone.run(() => {
        this.jobError = e?.error?.detail ?? 'No se pudo ejecutar el job. Intentá de nuevo.';
        this.jobLoading = false;
        this.cdr.detectChanges();
      });
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
        status: this.pendingAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date().toISOString(),
      })
    );

    // ✅ CERRAR UI INMEDIATAMENTE (antes del reload)
    this.zone.run(() => {
      this.confirmOpen = false;
      this.pendingAction = null;
      this.selected = null;
      this.cdr.detectChanges();
    });

    // ✅ ahora sí refrescás la lista
    await this.loadRequests();

  } catch (e) {
    this.zone.run(() => {
      this.confirmError = 'No se pudo completar la acción.';
      this.cdr.detectChanges();
    });
  } finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
}
