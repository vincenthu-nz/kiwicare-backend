import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('provider_services')
export class ProviderService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId: string;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId: string;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'integer', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
