import { Column, Entity, PrimaryColumn } from 'typeorm';
import { UserRole } from '../../core/enums/user.enum';

@Entity('pending_users')
export class PendingUser {
  @PrimaryColumn()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
