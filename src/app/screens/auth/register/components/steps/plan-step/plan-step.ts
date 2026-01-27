import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-plan-step',
  standalone: false,
  templateUrl: './plan-step.html',
  styleUrl: './plan-step.scss',
})
export class PlanStep {
  @Input() group!: FormGroup;

  select(planId: 'FREE' | 'PRO'): void {
    this.group.get('planId')?.setValue(planId);
    this.group.get('planId')?.markAsTouched();
  }

  isSelected(planId: 'FREE' | 'PRO'): boolean {
    return this.group.get('planId')?.value === planId;
  }
}