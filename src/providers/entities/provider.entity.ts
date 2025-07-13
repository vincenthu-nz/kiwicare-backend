import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Exclude } from 'class-transformer';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relation
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.provider, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Orders relation
  @OneToMany(() => Order, (order) => order.provider)
  orders: Order[];

  // Profile fields
  @Column({ unique: true, nullable: true, name: 'license_number' })
  licenseNumber: string;

  @Column({ type: 'int', default: 10, name: 'service_radius_km' })
  serviceRadiusKm: number;

  @Column({ nullable: true, name: 'base_address' })
  baseAddress: string;

  @Column({ type: 'double precision', nullable: true, name: 'base_latitude' })
  baseLatitude: number;

  @Column({ type: 'double precision', nullable: true, name: 'base_longitude' })
  baseLongitude: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @Exclude()
  updatedAt: Date;
}
