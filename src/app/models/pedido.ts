export type PedidoPrioridad = 'NORMAL' | 'URGENTE' | 'CRITICA';
export type PedidoEstado = 'ACTIVO' | 'COMPLETO' | 'CANCELADO';

export interface Pedido {
  id: string;
  fechaHora: string;
  servicio: string;
  componente: string;
  grupoSanguineo: string;
  prioridad: PedidoPrioridad;
  estado: PedidoEstado;
  solicitadoPor: string;
  comentarios?: string;
  cantidadSolicitadaMl: number;
  cantidadObtenidaMl: number;
}
