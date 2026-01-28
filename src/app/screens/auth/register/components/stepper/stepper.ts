import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stepper',
  standalone: false,
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
})
export class Stepper implements OnChanges {
  @Input() steps: { key: string; label: string }[] = [];
  @Input() activeIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeIndex']) {
      this.cdr.detectChanges();
    }
  }
}
