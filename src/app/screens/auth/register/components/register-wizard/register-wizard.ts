import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type RegisterStep = 'hospital' | 'admin' | 'plan' | 'review';

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      hospital: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.pattern(/^.+@.+$/)]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
        logoFile: [null],
        address: this.fb.group({
          street: ['', [Validators.required]],
          number: ['', [Validators.required]],
          city: ['', [Validators.required]],
          localidad: ['', [Validators.required]],
          province: ['', [Validators.required]],
        }),
      }),

      admin: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
        phone: ['', [Validators.maxLength(20)]], // opcional, validación real la hacemos limpiando input
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
        confirmPassword: ['', [Validators.required, Validators.maxLength(64)]],
      }),
      plan: this.fb.group({
        planId: ['FREE', [Validators.required]],
      }),
    });
  }

  get currentStep(): RegisterStep {
    return this.stepOrder[this.stepIndex];
  }

  goNext(): void {
    this.errorMsg = '';
    /*if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      this.errorMsg = 'Revisá los campos del paso actual.';
      return;
    }*/
    if (this.stepIndex < this.stepOrder.length - 1) this.stepIndex += 1;
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
    return this.form.valid;
  }

  private isAdminValid(): boolean {
    const admin = this.form.get('admin') as FormGroup;
    if (!admin) return false;

    const pw = admin.get('password')?.value;
    const cpw = admin.get('confirmPassword')?.value;

    return admin.valid && pw && cpw && pw === cpw;
  }

  private markStepTouched(step: RegisterStep): void {
    const ctrl =
      step === 'hospital'
        ? this.form.get('hospital')
        : step === 'admin'
        ? this.form.get('admin')
        : step === 'plan'
        ? this.form.get('plan')
        : this.form;

    ctrl?.markAllAsTouched();
  }

  async submit(): Promise<void> {
    this.errorMsg = '';
    if (!this.form.valid || !this.isAdminValid()) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Hay campos inválidos. Revisá antes de confirmar.';
      return;
    }

    this.loading = true;

    const payload = this.buildPayload();
    console.log('REGISTER PAYLOAD (draft):', payload);

    this.loading = false;
    this.router.navigate(['/signin'], { replaceUrl: true });
  }

  private buildPayload(): any {
    const hospital = this.form.get('hospital')?.value;
    const admin = this.form.get('admin')?.value;
    const plan = this.form.get('plan')?.value;

    return {
      hospital: {
        name: hospital.name,
        email: hospital.email, // ✅ agregado
        phone: hospital.phone,
        address: hospital.address,
      },
      admin: {
        fullName: admin.fullName,
        email: admin.email,
        password: admin.password,
      },
      plan: {
        planId: plan.planId,
      },
    };
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
}
