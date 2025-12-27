export type PedidoPrioridad = 'NORMAL' | 'URGENTE' | 'CRITICA';
export type PedidoEstado = 'PENDIENTE' | 'EN_PREPARACION' | 'CANCELADO' | 'RECHAZADO';

export interface Pedido {
  id: string;
  fechaHora: string;
  servicio: string;
  componente: string;
  grupoSanguineo: string;
  cantidad: number;
  prioridad: PedidoPrioridad;
  estado: PedidoEstado;
  solicitadoPor: string;
  comentarios?: string;
}
