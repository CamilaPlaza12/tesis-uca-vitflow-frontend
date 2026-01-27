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
}