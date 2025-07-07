import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { MapboxService } from '../mapbox/mapbox.service';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  BLOCKED_STATUSES,
  CUSTOMER_CANCEL_ALLOWED_STATUSES,
  PROVIDER_CANCEL_ALLOWED_STATUSES,
} from './order-status.constants';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity';

@Injectable()
export class OrdersService {
  private readonly RATE_PER_KM = 1;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    private readonly mapboxService: MapboxService,
    @InjectRepository(ProviderService)
    private readonly providerServiceRepo: Repository<ProviderService>,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    // Check for existing active orders
    const existingOrder = await this.orderRepo.findOne({
      where: {
        customerId,
        status: In(['pending', 'accepted']),
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        'You already have an active order. Please complete or cancel it before creating a new one.',
      );
    }

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
      status: order.status,
      scheduledStart: order.scheduledStart,
      createdAt: order.createdAt,
    };
  }

  async cancelOrder(
    user: { id: string; role: string },
    orderId: string,
    dto: CancelOrderDto,
  ) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (BLOCKED_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Order in status '${order.status}' cannot be cancelled`,
      );
    }

    if (user.role === 'customer') {
      const customer = await this.customerRepo.findOne({
        where: { id: order.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      if (customer.userId !== user.id) {
        throw new ForbiddenException('You can only cancel your own orders');
      }

      if (!CUSTOMER_CANCEL_ALLOWED_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          'Customer can only cancel pending orders',
        );
      }
    } else if (user.role === 'provider') {
      const provider = await this.providerRepo.findOne({
        where: { id: order.providerId },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      if (provider.userId !== user.id) {
        throw new ForbiddenException('You can only cancel your own orders');
      }

      if (!PROVIDER_CANCEL_ALLOWED_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          'Provider can only cancel pending or accepted orders',
        );
      }
    } else if (user.role === 'admin') {
      // Admin can cancel any order in any status
      // No ownership or status check
      order.cancelReason = 'Cancelled by system';
    } else {
      throw new ForbiddenException('You are not allowed to cancel orders');
    }

    this.applyCancellation(order, user, dto.cancelReason);

    await this.orderRepo.save(order, { reload: true });

    return {
      id: order.id,
      status: order.status,
      cancelledBy: {
        id: order.cancelledById,
        role: order.cancelledByRole,
      },
      cancelReason: order.cancelReason,
      cancelledAt: order.cancelledAt,
    };
  }

  private applyCancellation(
    order: Order,
    user: { id: string; role: string },
    reason: string,
  ) {
    order.cancelledById = user.id;
    order.cancelledByRole = user.role;
    order.cancelReason = reason;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
  }
}
