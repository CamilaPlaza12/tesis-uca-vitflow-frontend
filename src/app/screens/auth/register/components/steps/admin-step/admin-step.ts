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
    const pw = this.group.get('password')?.value;
    const cpw = this.group.get('confirmPassword')?.value;
    return !!pw && !!cpw && pw !== cpw;
  }
}