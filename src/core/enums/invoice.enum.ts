export enum InvoiceRole {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}

export enum InvoiceSource {
  ORDER = 'order',
  MANUAL = 'manual',
  SYSTEM = 'system',
  ADMIN = 'admin',
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}
