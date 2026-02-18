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
  @Input() uid = '';
  @Input() createdAt = '';

  @Input() firstName = '';
  @Input() lastName = '';
  @Input() phone = '';

  @Input() savingProfile = false;
  @Input() profileOk = false;
  @Input() profileError = '';

  @Input() changingPassword = false;
  @Input() passOk = false;
  @Input() passError = '';

  @Output() saveProfile = new EventEmitter<{ firstName: string; lastName: string; phone: string }>();
  @Output() changePassword = new EventEmitter<{ current: string; next: string; confirm: string }>();

  editing = false;

  form = { firstName: '', lastName: '', phone: '' };
  pass = { current: '', next: '', confirm: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firstName'] || changes['lastName'] || changes['phone']) {
      if (!this.editing) {
        this.form.firstName = this.firstName ?? '';
        this.form.lastName = this.lastName ?? '';
        this.form.phone = this.phone ?? '';
      }
    }

    if (changes['profileOk'] && this.profileOk) {
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

  submitProfile(): void {
    if (this.savingProfile) return;
    this.saveProfile.emit({
      firstName: (this.form.firstName ?? '').trim(),
      lastName: (this.form.lastName ?? '').trim(),
      phone: (this.form.phone ?? '').trim(),
    });
  }

  submitPassword(): void {
    if (this.changingPassword) return;
    this.changePassword.emit({ ...this.pass });
  }

  clearPassword(): void {
    this.pass.current = '';
    this.pass.next = '';
    this.pass.confirm = '';
  }
}
