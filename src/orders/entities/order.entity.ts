import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { Service } from './service.entity';
import { PaymentStatus } from '../../core/enums/payment-status.enum';
import { ClosureType, OrderStatus } from '../../core/enums/order.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Provider, (provider) => provider.orders)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId: string;

  @Column({ type: 'text', name: 'service_address' })
  serviceAddress: string;

  @Column({ type: 'double precision', name: 'service_latitude' })
  serviceLatitude: number;

  @Column({ type: 'double precision', name: 'service_longitude' })
  serviceLongitude: number;

  @Column({ type: 'integer', name: 'distance_m' })
  distanceM: number;

  @Column({ type: 'integer', name: 'drive_duration_s' })
  driveDurationS: number;

  @Column({ type: 'integer', name: 'service_fee' })
  serviceFee: number;

  @Column({ type: 'integer', name: 'travel_fee' })
  travelFee: number;

  @Column({ type: 'integer', name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'integer', name: 'platform_fee' })
  platformFee: number;

  @Column({ type: 'jsonb', name: 'route_geometry' })
  routeGeometry: any;

  @Column({ type: 'timestamptz', name: 'scheduled_start' })
  scheduledStart: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'text', nullable: true, name: 'closure_type' })
  closureType?: ClosureType;

  @Column({ type: 'text', nullable: true, name: 'closure_reason' })
  closureReason?: string;

  @Column({ type: 'uuid', nullable: true, name: 'closure_by_id' })
  closureById?: string;

  @Column({ type: 'text', nullable: true, name: 'closure_by_role' })
  closureByRole?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'closure_at' })
  closureAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'double precision', nullable: true, name: 'start_latitude' })
  startLatitude: number;

  @Column({ type: 'double precision', nullable: true, name: 'start_longitude' })
  startLongitude: number;

  @Column({ type: 'integer', nullable: true, name: 'actual_service_m' })
  actualServiceMinutes: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column({
    type: 'double precision',
    nullable: true,
    name: 'completed_latitude',
  })
  completedLatitude?: number;

  @Column({
    type: 'double precision',
    nullable: true,
    name: 'completed_longitude',
  })
  completedLongitude?: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;
}
