import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ORDER_STATUSES, OrderStatus } from '../order-status.constants';
import { Customer } from './customer.entity';
import { Provider } from './provider.entity';
import { Service } from './service.entity';

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

  @Column({ type: 'integer', name: 'duration_s' })
  durationS: number;

  @Column({ type: 'numeric', name: 'service_fee' })
  serviceFee: number;

  @Column({ type: 'numeric', name: 'travel_fee' })
  travelFee: number;

  @Column({ type: 'numeric', name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'jsonb', name: 'route_geometry' })
  routeGeometry: any;

  @Column({ type: 'timestamptz', name: 'scheduled_start' })
  scheduledStart: Date;

  @Column({
    type: 'enum',
    enum: ORDER_STATUSES,
    default: 'pending',
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'text', nullable: true, name: 'closure_type' })
  closureType?: 'cancel' | 'reject';

  @Column({ type: 'text', nullable: true, name: 'closure_reason' })
  closureReason?: string;

  @Column({ type: 'uuid', nullable: true, name: 'closure_by_id' })
  closureById?: string;

  @Column({ type: 'text', nullable: true, name: 'closure_by_role' })
  closureByRole?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'closure_at' })
  closureAt?: Date;
}
