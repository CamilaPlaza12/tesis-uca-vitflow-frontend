import { Component, OnInit } from '@angular/core';
import { HospitalRequest, HospitalRequestCreate, UpdateHospitalRequestRequest } from '../../../models/pedido';
import { PedidoService } from '../../../service/pedido_service';

@Component({
  selector: 'app-pedidos-alertas',
  standalone: false,
  templateUrl: './pedidos-alertas.html',
  styleUrl: './pedidos-alertas.scss',
})
export class PedidosAlertas implements OnInit {
  pedidos: HospitalRequest[] = [];
  pedidoSeleccionado: HospitalRequest | null = null;

  constructor(private hospitalRequestService: PedidoService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  private cargarPedidos(): void {
    this.hospitalRequestService.getHospitalRequests().subscribe({
      next: (data) => {
        this.pedidos = data;
      },
      error: (err) => {
        console.error('Error cargando hospital requests', err);
      },
    });
  }

  onCrearNuevoPedido(body: HospitalRequestCreate): void {
    this.hospitalRequestService.createHospitalRequest(body).subscribe({
      next: (_) => {
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error creando hospital request', err);
      },
    });
  }

  onSelectPedido(pedido: HospitalRequest): void {
    this.pedidoSeleccionado = pedido;
  }

  onCerrarDetalle(): void {
    this.pedidoSeleccionado = null;
  }

 onPedidoActualizado(body: UpdateHospitalRequestRequest): void {
  if (!this.pedidoSeleccionado) return;

  this.hospitalRequestService
    .updateHospitalRequest(this.pedidoSeleccionado.id, body)
    .subscribe({
      next: (updated) => {
        this.pedidos = this.pedidos.map(p =>
          p.id === updated.id ? updated : p
        );
        this.pedidoSeleccionado = updated;
      },
      error: (err) => {
        console.error('Error actualizando pedido', err);
      },
    });
}


}
