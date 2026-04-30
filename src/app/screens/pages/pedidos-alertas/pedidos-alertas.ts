import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { HospitalRequest } from '../../../models/pedido';
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
      next: (data: HospitalRequest[]) => {
        const hoy = new Date().toISOString().slice(0, 10);
        const vencidos = data.filter(p => p.status === 'ACTIVO' && p.end_date <= hoy);

        if (vencidos.length === 0) {
          this.pedidos = data;
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        forkJoin(
          vencidos.map(p =>
            this.hospitalRequestService.updateHospitalRequest(p.id, { status: 'FINALIZADO' })
          )
        ).subscribe({
          next: (actualizados) => {
            const map = new Map(actualizados.map(p => [p.id, p]));
            this.pedidos = data.map(p => map.get(p.id) ?? p);
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.pedidos = data;
            this.cargando = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  onCrearNuevoPedido(_pedido: HospitalRequest): void {
    this.cargarPedidos();
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

  onPedidoCancelado(updated: HospitalRequest): void {
    this.pedidos = this.pedidos.map(p => (p.id === updated.id ? updated : p));
    this.pedidoSeleccionado = updated;
    this.cdr.detectChanges();
  }


}
