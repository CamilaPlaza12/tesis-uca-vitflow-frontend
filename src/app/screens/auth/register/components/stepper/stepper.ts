import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  standalone: false,
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
})
export class Stepper {
  @Input() steps: { key: string; label: string }[] = [];
  @Input() activeIndex = 0;
}
