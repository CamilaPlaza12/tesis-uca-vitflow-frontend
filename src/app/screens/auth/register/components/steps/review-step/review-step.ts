import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

type PlanId = 0 | 1;
type OnboardingStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

interface HospitalOnboardingRequest {
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
    address: any;
  };
  plan: {
    planId: PlanId;
  };
  status: OnboardingStatus;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-review-step',
  standalone: false,
  templateUrl: './review-step.html',
  styleUrl: './review-step.scss',
})
export class ReviewStep {
  @Input() form!: FormGroup;

  get hospital(): any { return this.form.get('hospital')?.value; }
  get admin(): any { return this.form.get('admin')?.value; }
  get plan(): any { return this.form.get('plan')?.value; }

  get adminFullName(): string {
    const fn = this.admin?.firstName ?? '';
    const ln = this.admin?.lastName ?? '';
    const full = `${fn} ${ln}`.trim();
    return full || '—';
  }

  get planLabel(): string {
    const id: PlanId | undefined = this.plan?.planId;
    if (id === 1) return 'Pro';
    if (id === 0) return 'Free';
    return '—';
  }

  get planSubtitle(): string {
    const id: PlanId | undefined = this.plan?.planId;
    if (id === 1) return 'Gestión profesional para escalar';
    if (id === 0) return 'Operación base para empezar';
    return '';
  }

  get fullAddress(): string {
    const a = this.hospital?.address;
    if (!a) return '—';

    const street = [a.street, a.number].filter(Boolean).join(' ');
    const place = [a.city, a.localidad, a.province].filter(Boolean).join(', ');

    if (!street && !place) return '—';
    if (!street) return place;
    if (!place) return street;
    return `${street}, ${place}`;
  }

  get logoName(): string {
    return this.hospital?.logoFile?.name || 'Sin logo';
  }

  get hasLogo(): boolean {
    return !!this.hospital?.logoFile;
  }

  // ✅ Esto queda para que el wizard lo use si querés
  buildRequestPayload(): HospitalOnboardingRequest {
    const now = new Date().toISOString();

    const admin = this.admin ?? {};
    const hospital = this.hospital ?? {};
    const plan = this.plan ?? {};

    return {
      admin: {
        email: String(admin.email ?? '').trim(),
        firstName: String(admin.firstName ?? '').trim(),
        lastName: String(admin.lastName ?? '').trim(),
        phone: String(admin.phone ?? '').trim(),
        dni: String(admin.dni ?? '').trim(),
      },
      hospital: {
        name: String(hospital.name ?? '').trim(),
        email: String(hospital.email ?? '').trim(),
        phone: String(hospital.phone ?? '').trim(),
        address: hospital.address ?? null,
      },
      plan: {
        planId: (plan.planId as PlanId),
      },
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };
  }
}
