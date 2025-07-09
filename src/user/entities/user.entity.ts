import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { Customer } from '../../orders/entities/customer.entity';
import { Provider } from '../../orders/entities/provider.entity';
import { Gender, UserRole, UserStatus } from '../../core/enums/user.enum';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User name' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Email address', uniqueItems: true })
  @Column({ type: 'text', unique: true })
  email: string;

  @ApiProperty({ description: 'Password (hashed)' })
  @Exclude()
  @Column({ type: 'text', select: false })
  password: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Gender', default: 'prefer not to say' })
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.PREFER_NOT_TO_SAY,
  })
  gender: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'City', required: false })
  @Column({ type: 'text', nullable: true })
  city?: string;

  @ApiProperty({ description: 'User role', default: 'customer' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @Exclude()
  role: string;

  @Column({ type: 'integer', default: 0 })
  balance: number;

  @ApiProperty({
    description: 'User status',
    default: UserStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: string;

  @ApiProperty({ description: 'Email verified', default: false })
  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verified', default: false })
  @Column({ type: 'boolean', default: false, name: 'phone_verified' })
  phoneVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  @Exclude()
  lastLoginAt?: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Exclude()
  updatedAt: Date;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  @Exclude()
  isDeleted: boolean;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  @OneToOne(() => Provider, (provider) => provider.user)
  provider: Provider;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = bcrypt.hashSync(this.password);
    }
  }
}
