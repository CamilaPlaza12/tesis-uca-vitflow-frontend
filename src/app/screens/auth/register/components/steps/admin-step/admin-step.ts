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

  showPw = false;
  showCpw = false;

  togglePw(): void { this.showPw = !this.showPw; }
  toggleCpw(): void { this.showCpw = !this.showCpw; }

  get pw(): string { return String(this.group.get('password')?.value ?? ''); }
  get cpw(): string { return String(this.group.get('confirmPassword')?.value ?? ''); }

  get pwMismatch(): boolean { return !!this.pw && !!this.cpw && this.pw !== this.cpw; }
  get pwMatch(): boolean { return !!this.pw && !!this.cpw && this.pw === this.cpw; }

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
}
