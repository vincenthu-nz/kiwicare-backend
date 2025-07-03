import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pending_users')
export class PendingUser {
  @PrimaryColumn()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ unique: true })
  token: string;

  // @CreateDateColumn()
  // createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
