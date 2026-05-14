import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-config-profile-security-card',
  standalone: false,
  templateUrl: './config-profile-security-card.html',
  styleUrl: './config-profile-security-card.scss',
})
export class ConfigProfileSecurityCard implements OnChanges {
  @Input() email = '';
  @Input() roleLabel = '';

  @Input() firstName = '';
  @Input() lastName = '';
  @Input() phone = '';

  @Input() saving = false;
  @Input() ok = false;
  @Input() error = '';

  @Output() saveProfile = new EventEmitter<{ firstName: string; lastName: string; phone: string }>();

  editing = false;

  form = { firstName: '', lastName: '', phone: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firstName'] || changes['lastName'] || changes['phone']) {
      if (!this.editing) {
        this.form.firstName = this.firstName ?? '';
        this.form.lastName = this.lastName ?? '';
        this.form.phone = this.phone ?? '';
      }
    }

    if (changes['ok'] && this.ok) {
      this.editing = false;
    }
  }

  startEdit(): void {
    this.editing = true;
    this.form.firstName = this.firstName ?? '';
    this.form.lastName = this.lastName ?? '';
    this.form.phone = this.phone ?? '';
  }

  cancelEdit(): void {
    this.editing = false;
    this.form.firstName = this.firstName ?? '';
    this.form.lastName = this.lastName ?? '';
    this.form.phone = this.phone ?? '';
  }

  submit(): void {
    if (this.saving) return;
    this.saveProfile.emit({
      firstName: (this.form.firstName ?? '').trim(),
      lastName: (this.form.lastName ?? '').trim(),
      phone: (this.form.phone ?? '').trim(),
    });
  }
}
