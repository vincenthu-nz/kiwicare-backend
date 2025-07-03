import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

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
    enum: ['male', 'female', 'gender diverse', 'prefer not to say'],
    default: 'prefer not to say',
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
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
  })
  @Exclude()
  role: string;

  @ApiProperty({
    description: 'User status',
    default: 'active',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'banned'],
    default: 'active',
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

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = bcrypt.hashSync(this.password);
    }
  }
}
