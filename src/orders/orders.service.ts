import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { MapboxService } from '../mapbox/mapbox.service';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';
import { ClosureOrderDto } from './dto/closure-order.dto';

import { Customer } from './entities/customer.entity';
import { Provider } from '../providers/entities/provider.entity';
import { calculateDistance } from '../core/utils/distance.util';
import { StartOrderDto } from './dto/start-order.dto';
import { OrdersPolicy } from './policies/orders.policy';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { User } from '../user/entities/user.entity';
import { centsToNzd, nzdToCents } from '../core/utils/currency.util';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { PaymentStatus } from '../core/enums/payment-status.enum';
import {
  BLOCKED_STATUSES,
  ClosureType,
  CUSTOMER_CANCEL_ALLOWED_STATUSES,
  OrderStatus,
  PROVIDER_CANCEL_ALLOWED_STATUSES,
} from '../core/enums/order.enum';

@Injectable()
export class OrdersService {
  private readonly RATE_PER_KM = 1; // NZD per km

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly mapboxService: MapboxService,
    @InjectRepository(ProviderService)
    private readonly providerServiceRepo: Repository<ProviderService>,
    private readonly ordersPolicy: OrdersPolicy,
  ) {}

  async createOrder(user: User, dto: CreateOrderDto) {
    const customer = await this.customerRepo.findOne({
      where: { userId: user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const customerId = customer.id;

    const existingOrder = await this.orderRepo.findOne({
      where: {
        customerId: customerId,
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

    const serviceFee = centsToNzd(providerService.price);

    const { distance, duration, geometry } =
      await this.mapboxService.getDirections(
        [dto.serviceLongitude, dto.serviceLatitude],
        [dto.providerLongitude, dto.providerLatitude],
      );

    const distanceKm = distance / 1000;
    const travelFee = +(distanceKm * this.RATE_PER_KM).toFixed(2);

    const totalAmount = serviceFee + travelFee;

    if (user.balance < totalAmount) {
      throw new BadRequestException('Insufficient balance. Please recharge.');
    }

    user.balance -= nzdToCents(totalAmount);
    await this.userRepo.save(user);

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
      driveDurationS: duration,
      routeGeometry: geometry,
      serviceFee: nzdToCents(serviceFee),
      travelFee: nzdToCents(travelFee),
      totalAmount: nzdToCents(totalAmount),
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
    });

    await this.orderRepo.save(order);

    return {
      id: order.id,
      distance,
      duration,
      travelFee,
      serviceFee,
      totalAmount,
      balance: user.balance,
      status: order.status,
      scheduledStart: order.scheduledStart,
      createdAt: order.createdAt,
    };
  }

  async cancelOrder(
    user: { id: string; role: string },
    orderId: string,
    dto: ClosureOrderDto,
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

    order.closureType = ClosureType.CANCEL;

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
      order.closureReason = 'Cancelled by system';
    } else {
      throw new ForbiddenException('You are not allowed to cancel orders');
    }

    this.applyCancellation(order, user, dto.reason);

    await this.orderRepo.save(order, { reload: true });

    return {
      id: order.id,
      status: order.status,
      cancelledBy: {
        id: order.closureById,
        role: order.closureByRole,
      },
      cancelReason: order.closureReason,
      cancelledAt: order.closureAt,
    };
  }

  async rejectOrder(
    user: { id: string; role: string },
    orderId: string,
    dto: ClosureOrderDto,
  ) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === 'provider') {
      const provider = await this.providerRepo.findOne({
        where: { id: order.providerId },
      });

      if (provider.userId !== user.id) {
        throw new ForbiddenException('This is not your order');
      }

      if (order.status !== 'pending') {
        throw new BadRequestException('Only pending orders can be rejected');
      }
    } else if (user.role === 'admin') {
      // admin can force reject any order status
    } else {
      throw new ForbiddenException('You are not allowed to reject orders');
    }

    order.status = OrderStatus.REJECTED;
    order.closureType = ClosureType.REJECT;
    order.closureReason = dto.reason;
    order.closureById = user.id;
    order.closureByRole = user.role;
    order.closureAt = new Date();

    await this.orderRepo.save(order, { reload: true });

    return {
      id: order.id,
      status: order.status,
      rejectedBy: order.closureById,
      rejectReason: order.closureReason,
      rejectedAt: order.closureAt,
    };
  }

  async getMyOrders(
    user: { id: string; role: string },
    status?: string,
    page = 1,
  ) {
    const take = 10;
    const skip = (page - 1) * take;

    let targetId: string;

    if (user.role === 'customer') {
      const customer = await this.customerRepo.findOne({
        where: { userId: user.id },
      });

      if (!customer) {
        throw new ForbiddenException('Customer record not found');
      }

      targetId = customer.id;

      const [data, total] = await this.orderRepo.findAndCount({
        where: this.buildOrderWhere('customer', targetId, status),
        order: { createdAt: 'DESC' },
        skip,
        take,
      });

      return {
        role: 'customer',
        page,
        pageSize: take,
        total,
        data,
      };
    }

    if (user.role === 'provider') {
      const provider = await this.providerRepo.findOne({
        where: { userId: user.id },
      });

      if (!provider) {
        throw new ForbiddenException('Provider record not found');
      }

      targetId = provider.id;

      const [data, total] = await this.orderRepo.findAndCount({
        where: this.buildOrderWhere('provider', targetId, status),
        relations: [
          'customer',
          'customer.user',
          'provider',
          'provider.user',
          'service',
        ],
        order: { createdAt: 'DESC' },
        skip,
        take,
      });

      const mappedData = data.map((order) => ({
        id: order.id,
        status: order.status,
        scheduledStart: order.scheduledStart,
        serviceAddress: order.serviceAddress,
        serviceLatitude: order.serviceLatitude,
        serviceLongitude: order.serviceLongitude,
        distanceM: order.distanceM,
        durationS: order.driveDurationS,
        serviceFee: order.serviceFee,
        travelFee: order.travelFee,
        totalAmount: order.totalAmount,
        routeGeometry: order.routeGeometry,
        note: order.note,
        createdAt: order.createdAt,

        customer: order.customer && {
          id: order.customer.id,
          name: order.customer.user.name,
          avatar: order.customer.user.avatar,
        },

        provider: order.provider && {
          id: order.provider.id,
          name: order.provider.user.name,
          avatar: order.provider.user.avatar,
        },

        service: order.service && {
          id: order.service.id,
          name: order.service.name,
        },
      }));

      return {
        page,
        pageSize: take,
        total,
        data: mappedData,
      };
    }

    throw new ForbiddenException('Your role cannot query orders');
  }

  async acceptOrder(user: { id: string; role: string }, orderId: string) {
    const order = await this.ordersPolicy.ensureProviderOwnsOrder(
      user.id,
      orderId,
    );

    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be accepted');
    }

    order.status = OrderStatus.ACCEPTED;
    order.updatedAt = new Date();

    await this.orderRepo.save(order);

    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }

  async startOrder(
    user: { id: string; role: string },
    orderId: string,
    dto: StartOrderDto,
  ) {
    const order = await this.ordersPolicy.ensureProviderOwnsOrder(
      user.id,
      orderId,
    );

    if (order.status !== 'accepted') {
      throw new BadRequestException('Only accepted orders can be started');
    }

    const distanceMeters = calculateDistance(
      dto.currentLatitude,
      dto.currentLongitude,
      order.serviceLatitude,
      order.serviceLongitude,
    );

    if (distanceMeters > 200) {
      throw new BadRequestException(
        'You are too far from the service address to start',
      );
    }

    order.status = OrderStatus.IN_PROGRESS;
    order.startedAt = new Date();
    order.startLatitude = dto.currentLatitude;
    order.startLongitude = dto.currentLongitude;
    order.updatedAt = new Date();

    await this.orderRepo.save(order);

    return {
      id: order.id,
      status: order.status,
      startedAt: order.startedAt,
    };
  }

  async completeOrder(
    user: { id: string; role: string },
    orderId: string,
    dto: CompleteOrderDto,
  ) {
    const order = await this.ordersPolicy.ensureProviderOwnsOrder(
      user.id,
      orderId,
    );

    if (order.status !== 'in_progress') {
      throw new BadRequestException('Only in-progress orders can be completed');
    }

    if (!order.startedAt) {
      throw new BadRequestException('Order has not been started');
    }

    const providerService = await this.providerServiceRepo.findOne({
      where: {
        providerId: order.providerId,
        serviceId: order.serviceId,
      },
    });

    if (!providerService) {
      throw new BadRequestException('Provider service configuration not found');
    }

    const elapsedMinutes =
      (new Date().getTime() - order.startedAt.getTime()) / (1000 * 60);
    if (elapsedMinutes < providerService.durationMinutes) {
      throw new BadRequestException(
        `Service time too short: must be at least ${providerService.durationMinutes} minutes`,
      );
    }

    const distanceMeters = calculateDistance(
      dto.currentLatitude,
      dto.currentLongitude,
      order.serviceLatitude,
      order.serviceLongitude,
    );

    if (distanceMeters > 200) {
      throw new BadRequestException(
        `You are too far from the service address to complete the order`,
      );
    }

    order.status = OrderStatus.COMPLETED;
    order.completedAt = new Date();
    order.completedLatitude = dto.currentLatitude;
    order.completedLongitude = dto.currentLongitude;
    order.actualServiceMinutes = Math.round(elapsedMinutes);
    order.updatedAt = new Date();

    await this.orderRepo.save(order);

    return {
      id: order.id,
      status: order.status,
      completedAt: order.completedAt,
      actualDurationMinutes: order.actualServiceMinutes,
    };
  }

  async addReview(orderId: string, userId: string, dto: CreateReviewDto) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'customer.user', 'provider', 'provider.user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'completed') {
      throw new BadRequestException('Only completed orders can be reviewed');
    }

    // Determine the role of the user making the request
    let authorRole: 'customer' | 'provider';
    let targetId: string;

    if (order.customer.user.id === userId) {
      authorRole = 'customer';
      targetId = order.provider.user.id;
    } else if (order.provider.user.id === userId) {
      authorRole = 'provider';
      targetId = order.customer.user.id;
    } else {
      throw new ForbiddenException('You are not part of this order');
    }

    //  Ensure the current role has not reviewed this order yet
    const existing = await this.reviewRepo.findOne({
      where: {
        orderId,
        authorRole,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `You (${authorRole}) have already reviewed this order`,
      );
    }

    await this.reviewRepo.insert({
      orderId,
      authorId: userId,
      targetId,
      authorRole,
      rating: dto.rating,
      comment: dto.comment,
      images: dto.images || [],
    });
  }

  private applyCancellation(
    order: Order,
    user: { id: string; role: string },
    reason: string,
  ) {
    order.closureById = user.id;
    order.closureByRole = user.role;
    order.closureReason = reason;
    order.status = OrderStatus.CANCELLED;
    order.closureAt = new Date();
  }

  private buildOrderWhere(
    role: 'customer' | 'provider',
    id: string,
    status?: string,
  ): FindOptionsWhere<Order> {
    const where: FindOptionsWhere<Order> =
      role === 'customer' ? { customerId: id } : { providerId: id };

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    return where;
  }
}
