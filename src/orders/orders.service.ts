import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { MapboxService } from '../mapbox/mapbox.service';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';

@Injectable()
export class OrdersService {
  private readonly RATE_PER_KM = 1;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly mapboxService: MapboxService,
    @InjectRepository(ProviderService)
    private readonly providerServiceRepo: Repository<ProviderService>,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    // Check if the selected provider offers the requested service
    const providerService = await this.providerServiceRepo.findOne({
      where: {
        providerId: dto.providerId,
        serviceId: dto.serviceId,
      },
    });

    if (!providerService) {
      throw new BadRequestException(
        'Selected provider does not offer this service',
      );
    }

    const serviceFee = Number(providerService.price);

    const { distance, duration, geometry } =
      await this.mapboxService.getDirections(
        [dto.serviceLongitude, dto.serviceLatitude],
        [dto.providerLongitude, dto.providerLatitude],
      );

    const distanceKm = distance / 1000;

    const travelFee = Math.round(distanceKm * this.RATE_PER_KM * 100);
    const totalAmount = serviceFee + travelFee;

    const order = this.orderRepo.create({
      providerId: dto.providerId,
      customerId,
      serviceId: dto.serviceId,
      serviceAddress: dto.serviceAddress,
      serviceLatitude: dto.serviceLatitude,
      serviceLongitude: dto.serviceLongitude,
      scheduledStart: dto.scheduledStart,
      note: dto.note,
      distanceM: distance,
      durationS: duration,
      routeGeometry: geometry,
      serviceFee,
      travelFee,
      totalAmount,
      status: 'pending',
    });

    await this.orderRepo.save(order);

    return {
      id: order.id,
      distance,
      duration,
      travelFee,
      serviceFee,
      totalAmount,
    };
  }
}
