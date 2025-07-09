export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum ClosureType {
  CANCEL = 'cancel',
  REJECT = 'reject',
}

export const CUSTOMER_CANCEL_ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
];

export const PROVIDER_CANCEL_ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
];

export const BLOCKED_STATUSES: OrderStatus[] = [
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
];
