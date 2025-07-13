import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  async findById(id: string): Promise<Provider> {
    return this.providerRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: Provider[]; total: number }> {
    const radiusMeters = radiusKm * 1000;
    const offset = (page - 1) * limit;

    const qb = this.providerRepo
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .addSelect(
        `
      ST_Distance(
        ST_SetSRID(ST_MakePoint(provider.baseLongitude, provider.baseLatitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      )`,
        'distance',
      )
      .where(
        `
      ST_DWithin(
        ST_SetSRID(ST_MakePoint(provider.baseLongitude, provider.baseLatitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )
    `,
        { lat: latitude, lng: longitude, radius: radiusMeters },
      )
      .andWhere(
        `
      ST_Distance(
        ST_SetSRID(ST_MakePoint(provider.baseLongitude, provider.baseLatitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      ) <= (provider.service_radius_km * 1000)
    `,
        { lat: latitude, lng: longitude },
      )
      .orderBy('distance', 'ASC')
      .offset(offset)
      .limit(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }
}
