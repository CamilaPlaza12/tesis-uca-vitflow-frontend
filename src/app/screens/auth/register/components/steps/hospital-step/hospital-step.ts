import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-hospital-step',
  standalone: false,
  templateUrl: './hospital-step.html',
  styleUrl: './hospital-step.scss',
})
export class HospitalStep {
  @Input() group!: FormGroup;

  fileName = '';

  onLogoSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.group.get('logoFile')?.setValue(file);
    this.group.get('logoFile')?.markAsTouched();
    this.fileName = file?.name ?? '';
  }

  clearLogo(input: HTMLInputElement): void {
    input.value = '';
    this.group.get('logoFile')?.setValue(null);
    this.group.get('logoFile')?.markAsTouched();
    this.fileName = '';
  }

  /** Solo dígitos (para número de calle y para teléfono). */
  onlyDigits(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const cleaned = (input.value || '').replace(/\D+/g, '');
    if (input.value !== cleaned) input.value = cleaned;
    // IMPORTANTE: seteo explícito para que el FormControl quede igual al input limpio
    const name = input.getAttribute('formControlName');
    if (name) this.group.get(name)?.setValue(cleaned, { emitEvent: true });
  }

  /** Teléfono AR: solo dígitos, sin +54 (eso lo mostramos fijo). */
  onlyPhoneDigits(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const cleaned = (input.value || '').replace(/\D+/g, '');
    if (input.value !== cleaned) input.value = cleaned;

    // guardamos solo la parte numérica (sin +54)
    this.group.get('phone')?.setValue(cleaned, { emitEvent: true });
    this.group.get('phone')?.markAsTouched();
  }
}
