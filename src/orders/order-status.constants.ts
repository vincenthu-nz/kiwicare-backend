export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// The statuses allowed for cancellation by different roles
export const CUSTOMER_CANCEL_ALLOWED_STATUSES: OrderStatus[] = ['pending'];
export const PROVIDER_CANCEL_ALLOWED_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
];
export const BLOCKED_STATUSES: OrderStatus[] = [
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
];
