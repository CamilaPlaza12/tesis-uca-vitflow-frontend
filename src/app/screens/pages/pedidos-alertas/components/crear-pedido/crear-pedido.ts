import { Component } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-crear-pedido',
  standalone: false,
  templateUrl: './crear-pedido.html',
  styleUrl: './crear-pedido.scss',
})
export class CrearPedido {
  @Output() crearPedido = new EventEmitter<void>();

  onClick(): void {
    this.crearPedido.emit();
  }
}
