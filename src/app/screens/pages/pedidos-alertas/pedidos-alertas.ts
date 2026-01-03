import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  cargando = true;

  constructor(
    private hospitalRequestService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  private cargarPedidos(): void {
    this.cargando = true;
    
    this.hospitalRequestService.getHospitalRequests().subscribe({
      next: (data: any) => {
        this.pedidos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
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
  onPedidoActualizado(updated: HospitalRequest): void {
  this.pedidos = this.pedidos.map(p => (p.id === updated.id ? updated : p));
  this.pedidoSeleccionado = null;
  this.cdr.detectChanges();
}


}
