import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
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

  /** ✅ hardcode para test (ponelo en false cuando quieras) */
  private readonly DEV_PREFILL = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      hospital: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
        phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(14)]], // sin +54 (lo tenés fijo en UI)
        logoFile: [null],
        address: this.fb.group({
          province: ['', [Validators.required, Validators.maxLength(60)]],
          localidad: ['', [Validators.required, Validators.maxLength(60)]],
          city: ['', [Validators.required, Validators.maxLength(60)]],
          street: ['', [Validators.required, Validators.maxLength(80)]],
          number: ['', [Validators.required, Validators.maxLength(10)]],
        }),
      }),

      admin: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
        phone: [
          '',
          [
            Validators.required,
            Validators.maxLength(20),
            Validators.pattern(/^\+?[0-9\s()-]{8,20}$/),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
        confirmPassword: ['', [Validators.required, Validators.maxLength(64)]],
      }),

      plan: this.fb.group({
        planId: ['FREE', [Validators.required]],
      }),
    });

    if (this.DEV_PREFILL) this.prefill();
  }

  private prefill(): void {
    this.form.patchValue({
      hospital: {
        name: 'Hospital Demo',
        email: 'contacto@hospital.com',
        phone: '1112345678',
        address: {
          province: 'Buenos Aires',
          localidad: 'San Isidro',
          city: 'San Isidro',
          street: 'Av. Santa Fe',
          number: '1234',
        },
      },
      admin: {
        fullName: 'Admin Demo',
        email: 'admin@hospital.com',
        phone: '+54 11 1234 5678',
        password: 'Vitflow123',
        confirmPassword: 'Vitflow123',
      },
      plan: { planId: 'FREE' },
    });

    // para que no salten errores rojos apenas cargás
    this.form.markAsPristine();
    this.form.markAsUntouched();
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

  goNext(): void {
    this.errorMsg = '';

    if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      this.errorMsg = 'Revisá los campos del paso actual.';
      return;
    }

    if (this.stepIndex < this.stepOrder.length - 1) {
      this.stepIndex += 1;

      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }


  goBack(): void {
    this.errorMsg = '';
    if (this.stepIndex > 0) {
      this.stepIndex -= 1;

      this.zone.run(() => {
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      });
    }
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

    const pw = String(admin.get('password')?.value ?? '');
    const cpw = String(admin.get('confirmPassword')?.value ?? '');

    return admin.valid && pw.length > 0 && cpw.length > 0 && pw === cpw;
  }

  private markStepTouched(step: RegisterStep): void {
    const ctrl =
      step === 'hospital' ? this.form.get('hospital')
      : step === 'admin' ? this.form.get('admin')
      : step === 'plan' ? this.form.get('plan')
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
    console.log('REGISTER PAYLOAD (draft):', this.form.value);
    this.loading = false;

    this.router.navigate(['/signin'], { replaceUrl: true });
  }
}
