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

  onPhoneInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    let v = input.value ?? '';

    v = v.replace(/[^0-9+\s()-]/g, '');

    const startsWithPlus = v.trim().startsWith('+');
    v = v.replace(/\+/g, '');
    if (startsWithPlus) v = `+${v}`;

    input.value = v;
    this.group.get('phone')?.setValue(v, { emitEvent: true });
    this.group.get('phone')?.markAsTouched();
  }

  onDniInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    let v = input.value ?? '';

    // Solo números
    v = v.replace(/\D/g, '');

    // DNI AR suele ser 7-8 dígitos; acá solo limpiamos y limitamos
    v = v.slice(0, 8);

    input.value = v;
    this.group.get('dni')?.setValue(v, { emitEvent: true });
    this.group.get('dni')?.markAsTouched();
  }
}
