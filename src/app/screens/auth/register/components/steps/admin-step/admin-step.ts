import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-step',
  standalone: false,
  templateUrl: './admin-step.html',
  styleUrl: './admin-step.scss',
})
export class AdminStep {
  @Input() group!: FormGroup;

  get pwMismatch(): boolean {
    const pw = String(this.group.get('password')?.value ?? '');
    const cpw = String(this.group.get('confirmPassword')?.value ?? '');
    return !!pw && !!cpw && pw !== cpw;
  }

  /** Teléfono: permitimos + al inicio y dígitos. También dejamos espacios/guiones pero los limpiamos. */
  onAdminPhoneInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    let v = input.value ?? '';

    // Permitimos + solo si está al principio
    const hasPlus = v.trim().startsWith('+');

    // Limpiamos todo lo que no sea dígito
    const digits = v.replace(/\D+/g, '');

    // Reconstruimos
    const rebuilt = hasPlus ? `+${digits}` : digits;

    if (input.value !== rebuilt) input.value = rebuilt;

    this.group.get('phone')?.setValue(rebuilt, { emitEvent: true });
    this.group.get('phone')?.markAsTouched();
  }
}
