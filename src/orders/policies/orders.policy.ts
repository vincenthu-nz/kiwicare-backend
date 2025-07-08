import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '../entities/provider.entity';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersPolicy {
  constructor(
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async ensureProviderOwnsOrder(
    userId: string,
    orderId: string,
  ): Promise<Order> {
    const provider = await this.providerRepo.findOneBy({ userId });
    if (!provider) {
      throw new ForbiddenException('You are not a valid provider');
    }

    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.providerId !== provider.id) {
      throw new ForbiddenException('This order is not assigned to you');
    }

    return order;
  }
}
