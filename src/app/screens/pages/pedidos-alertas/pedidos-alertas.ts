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

  // Mapa pedidoId → cantidad de PENDIENTE_CLASIFICACION
  // Se construye a partir del campo pending_classifications_count que ya viene en cada pedido
  pendientesMap: Record<string, number> = {};

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
        const vencidos = data.filter((p) => p.status === 'ACTIVO' && p.end_date <= hoy);

        if (vencidos.length === 0) {
          this.pedidos = data;
          this.pendientesMap = this.buildPendientesMap(data);
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        forkJoin(
          vencidos.map((p) =>
            this.hospitalRequestService.updateHospitalRequest(p.id, { status: 'FINALIZADO' })
          )
        ).subscribe({
          next: (actualizados) => {
            const map = new Map(actualizados.map((p) => [p.id, p]));
            this.pedidos = data.map((p) => map.get(p.id) ?? p);
            this.pendientesMap = this.buildPendientesMap(this.pedidos);
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.pedidos = data;
            this.pendientesMap = this.buildPendientesMap(data);
            this.cargando = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildPendientesMap(pedidos: HospitalRequest[]): Record<string, number> {
    const map: Record<string, number> = {};
    pedidos.forEach((p) => {
      const count = p.pending_classifications_count ?? 0;
      if (count > 0) map[p.id] = count;
    });
    return map;
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
    this.pedidos = this.pedidos.map((p) => (p.id === updated.id ? updated : p));
    this.pedidoSeleccionado = null;
    this.cdr.detectChanges();
  }

  onPedidoCancelado(updated: HospitalRequest): void {
    this.pedidos = this.pedidos.map((p) => (p.id === updated.id ? updated : p));
    this.pedidoSeleccionado = updated;
    this.cdr.detectChanges();
  }

  onPendientesChanged(pedidoId: string, newCount: number): void {
    if (newCount <= 0) {
      const { [pedidoId]: _, ...rest } = this.pendientesMap;
      this.pendientesMap = rest;
    } else {
      this.pendientesMap = { ...this.pendientesMap, [pedidoId]: newCount };
    }
    this.cdr.detectChanges();
  }
}
