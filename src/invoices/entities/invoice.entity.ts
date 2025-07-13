import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../user/entities/user.entity';
import {
  InvoiceRole,
  InvoiceSource,
  InvoiceStatus,
} from '../../core/enums/invoice.enum';
import { Exclude } from 'class-transformer';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Related order, can be null
  @ManyToOne(() => Order, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  //  Related user, payer or payee
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: InvoiceRole,
    default: InvoiceRole.CUSTOMER,
  })
  role: InvoiceRole;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'integer', default: 0, name: 'tax_rate' })
  taxRate: number;

  @Column({ type: 'integer', default: 0, name: 'platform_fee' })
  platformFee: number;

  @Column({ type: 'text', name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'refund_at' })
  refundAt: Date;

  @Column({ type: 'text', nullable: true, name: 'refund_reason' })
  refundReason: string;

  @Column({
    type: 'enum',
    enum: InvoiceSource,
    default: InvoiceSource.ORDER,
  })
  source: InvoiceSource;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  @Exclude()
  date: Date;
}
