import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

type PlanId = 0 | 1; // 0 = FREE, 1 = PRO

@Component({
  selector: 'app-plan-step',
  standalone: false,
  templateUrl: './plan-step.html',
  styleUrl: './plan-step.scss',
})
export class PlanStep {
  @Input() group!: FormGroup;

  select(planId: PlanId): void {
    this.group.get('planId')?.setValue(planId);
    this.group.get('planId')?.markAsTouched();
  }

  isSelected(planId: PlanId): boolean {
    return this.group.get('planId')?.value === planId;
  }
}
