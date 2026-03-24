import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user_service';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  form: FormGroup;
  loading = false;

  modalOpen = false;
  modalTitle = '';
  modalMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  private showError(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalOpen = true;

    // Fuerza el render aunque estés “zoneless” o fuera de zone
    this.cdr.detectChanges();
  }

  onModalClosed(): void {
    this.modalOpen = false;
    this.cdr.detectChanges();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      const { email, password } = this.form.value;

      const result = await this.userService.login(String(email), String(password));

      if (result.ok) {
        this.router.navigate(['/home'], { replaceUrl: true });
        return;
      }

      this.showError('No se pudo iniciar sesión', result.message);
    } catch (e) {
      console.error(e);
      this.showError('Ups…', 'Ocurrió un error inesperado. Probá de nuevo en unos segundos.');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onGoogleSignIn(): void { console.log('Google sign in clickeado'); }
  onForgotPassword(): void { console.log('Olvidé mi contraseña clickeado'); }
  onRequestAccess(): void { this.router.navigate(['/register']); }
}
