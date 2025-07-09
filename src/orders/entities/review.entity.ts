import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../user/entities/user.entity';

@Entity('reviews')
@Unique(['orderId', 'authorRole']) // One review per role per order
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_id' })
  target: User;

  @Column({ type: 'uuid', name: 'target_id' })
  targetId: string;

  @Column({
    type: 'text',
    name: 'author_role',
  })
  authorRole: 'customer' | 'provider';

  @Column({
    type: 'int',
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment?: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  images?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
