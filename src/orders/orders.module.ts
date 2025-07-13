import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MapboxModule } from '../mapbox/mapbox.module';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';
import { AuthModule } from '../auth/auth.module';
import { Customer } from './entities/customer.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Service } from './entities/service.entity';
import { OrdersPolicy } from './policies/orders.policy';
import { User } from '../user/entities/user.entity';
import { Review } from './entities/review.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Customer,
      Provider,
      Service,
      User,
      Review,
      Invoice,
      ProviderService,
    ]),
    MapboxModule,
    AuthModule,
  ],
  providers: [OrdersService, OrdersPolicy],
  controllers: [OrdersController],
})
export class OrdersModule {}
