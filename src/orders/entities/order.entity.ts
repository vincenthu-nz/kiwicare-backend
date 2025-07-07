import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ORDER_STATUSES, OrderStatus } from '../order-status.constants';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId: string;

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

  @CreateDateColumn({ type: 'text' })
  note: string;

  @Column({ type: 'uuid', name: 'cancelled_by_id', nullable: true })
  cancelledById?: string;

  @Column({ type: 'text', name: 'cancelled_by_role', nullable: true })
  cancelledByRole?: string;

  @Column({ type: 'text', name: 'cancel_reason', nullable: true })
  cancelReason?: string;

  @Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;
}
