import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { EntityManager, Repository } from 'typeorm';
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
    manager?: EntityManager,
  ): Promise<Order> {
    const provider = await (manager
      ? manager.findOneBy(Provider, { userId })
      : this.providerRepo.findOneBy({ userId }));

    if (!provider) {
      throw new ForbiddenException('You are not a valid provider');
    }

    const order = await (manager
      ? manager.findOne(Order, {
          where: { id: orderId },
          relations: ['customer.user', 'provider.user'],
        })
      : this.orderRepo.findOne({
          where: { id: orderId },
          relations: ['customer.user', 'provider.user'],
        }));

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.providerId !== provider.id) {
      throw new ForbiddenException('This order is not assigned to you');
    }

    return order;
  }
}
