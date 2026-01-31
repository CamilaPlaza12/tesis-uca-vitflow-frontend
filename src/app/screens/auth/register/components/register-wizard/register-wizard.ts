import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type RegisterStep = 'hospital' | 'admin' | 'plan' | 'review';

// 0 = FREE, 1 = PRO
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
  selector: 'app-register-wizard',
  standalone: false,
  templateUrl: './register-wizard.html',
  styleUrl: './register-wizard.scss',
})
export class RegisterWizard {
  stepOrder: RegisterStep[] = ['hospital', 'admin', 'plan', 'review'];
  stepIndex = 0;

  form: FormGroup;

  loading = false;
  errorMsg = '';

  // ✅ Modal
  sendValidationOpen = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      hospital: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.minLength(6)]],
        logoFile: [null],
        address: this.fb.group({
          province: ['', [Validators.required]],
          localidad: [{ value: '', disabled: true }, [Validators.required]],
          city: [{ value: '', disabled: true }, [Validators.required]],
          street: [{ value: '', disabled: true }, [Validators.required]],
          number: [{ value: '', disabled: true }, [Validators.required]],
          provinceId: ['', [Validators.required]],
          localidadId: [{ value: '', disabled: true }, [Validators.required]],
        }),
      }),

      admin: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
        phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      }),

      plan: this.fb.group({
        planId: [null as PlanId | null, [Validators.required]],
      }),
    });
  }

  get currentStep(): RegisterStep {
    return this.stepOrder[this.stepIndex];
  }

  get hospitalGroup(): FormGroup {
    return this.form.get('hospital') as FormGroup;
  }
  get adminGroup(): FormGroup {
    return this.form.get('admin') as FormGroup;
  }
  get planGroup(): FormGroup {
    return this.form.get('plan') as FormGroup;
  }

  get adminEmail(): string {
    const admin = this.form.get('admin')?.value ?? {};
    return String(admin.email ?? '').trim();
  }

  goNext(): void {
    this.errorMsg = '';

    if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      return;
    }

    if (this.stepIndex < this.stepOrder.length - 1) {
      this.stepIndex += 1;
    }
  }

  goBack(): void {
    this.errorMsg = '';
    if (this.stepIndex > 0) this.stepIndex -= 1;
  }

  goToStep(index: number): void {
    if (index <= this.stepIndex) {
      this.stepIndex = index;
      return;
    }

    for (let i = 0; i < index; i++) {
      const step = this.stepOrder[i];
      if (!this.isStepValid(step)) {
        this.markStepTouched(step);
        this.stepIndex = i;
        this.errorMsg = 'Completá este paso antes de avanzar.';
        return;
      }
    }

    this.stepIndex = index;
  }

  private isStepValid(step: RegisterStep): boolean {
    if (step === 'hospital') return this.form.get('hospital')?.valid ?? false;
    if (step === 'admin') return this.isAdminValid();
    if (step === 'plan') return this.form.get('plan')?.valid ?? false;
    return this.form.valid && this.isAdminValid();
  }

  private isAdminValid(): boolean {
    const admin = this.form.get('admin') as FormGroup;
    if (!admin) return false;

    const dni = String(admin.get('dni')?.value ?? '').trim();
    const dniOk = /^\d{7,8}$/.test(dni);

    return admin.valid && dniOk;
  }

  private markStepTouched(step: RegisterStep): void {
    const ctrl =
      step === 'hospital' ? this.form.get('hospital')
      : step === 'admin' ? this.form.get('admin')
      : step === 'plan' ? this.form.get('plan')
      : this.form;

    ctrl?.markAllAsTouched();
  }

  // ✅ Botón rojo: ahora abre modal (no envía directo)
  submit(): void {
    this.errorMsg = '';

    if (!this.form.valid || !this.isAdminValid()) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Hay campos inválidos. Revisá antes de confirmar.';
      return;
    }

    this.sendValidationOpen = true;
  }

  onModalCancel(): void {
    if (this.loading) return;
    this.sendValidationOpen = false;
  }

async onModalConfirm(): Promise<void> {
  this.loading = true;

  try {
    const payload = this.buildOnboardingRequest();
    console.log('[hospital_onboarding_request] payload:', payload);

    // TODO Firestore:
    // await this.onboardingRequestsService.create(payload);

    this.sendValidationOpen = false;

    // ✅ Al confirmar, ir al login
    this.router.navigate(['/signin'], { replaceUrl: true });
  } finally {
    this.loading = false;
  }
}


  private buildOnboardingRequest(): HospitalOnboardingRequest {
    const now = new Date().toISOString();

    const hospital = this.form.get('hospital')?.value ?? {};
    const admin = this.form.get('admin')?.value ?? {};
    const plan = this.form.get('plan')?.value ?? {};

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
