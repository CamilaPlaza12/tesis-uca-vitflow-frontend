import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password } = this.form.value;
    console.log('Sign in con:', { email, password });

    setTimeout(() => {
      this.loading = false;
    }, 800);
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
