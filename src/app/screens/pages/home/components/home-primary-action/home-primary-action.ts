import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-primary-action',
  standalone: false,
  templateUrl: './home-primary-action.html',
  styleUrl: './home-primary-action.scss',
})
export class HomePrimaryActionComponent {
  @Output() clickAction = new EventEmitter<void>();
}
