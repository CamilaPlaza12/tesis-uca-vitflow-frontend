import { Component } from '@angular/core';
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
  errorMsg = '';

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    localStorage.removeItem('token');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const { email, password } = this.form.value;

    const ok = await this.userService.login(String(email), String(password));
    this.loading = false;

    if (ok) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.errorMsg = 'Email o contraseña incorrectos.';
    }
  }

  onGoogleSignIn(): void {
    console.log('Google sign in clickeado');
  }

  onForgotPassword(): void {
    console.log('Olvidé mi contraseña clickeado');
  }

  onRequestAccess(): void {
    console.log('Solicitar registro clickeado');
  }
}
