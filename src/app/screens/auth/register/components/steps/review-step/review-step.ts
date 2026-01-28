import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-review-step',
  standalone: false,
  templateUrl: './review-step.html',
  styleUrl: './review-step.scss',
})
export class ReviewStep {
  @Input() form!: FormGroup;

  get hospital(): any { return this.form.get('hospital')?.value; }
  get admin(): any { return this.form.get('admin')?.value; }
  get plan(): any { return this.form.get('plan')?.value; }

  get planLabel(): string {
    const id = this.plan?.planId;
    if (id === 'PRO') return 'Pro';
    if (id === 'FREE') return 'Free';
    return id || '—';
  }

  get planSubtitle(): string {
    const id = this.plan?.planId;
    if (id === 'PRO') return 'Gestión profesional para escalar';
    if (id === 'FREE') return 'Operación base para empezar';
    return '';
  }

  get fullAddress(): string {
    const a = this.hospital?.address;
    if (!a) return '—';

    const street = [a.street, a.number].filter(Boolean).join(' ');
    const place = [a.localidad, a.city, a.province].filter(Boolean).join(', ');

    if (!street && !place) return '—';
    if (!street) return place;
    if (!place) return street;
    return `${street}, ${place}`;
  }

  get logoName(): string {
    return this.hospital?.logoFile?.name || 'Sin logo';
  }

  get hasLogo(): boolean {
    return !!this.hospital?.logoFile;
  }
}
