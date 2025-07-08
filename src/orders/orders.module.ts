import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MapboxModule } from '../mapbox/mapbox.module';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';
import { AuthModule } from '../auth/auth.module';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity';
import { Service } from './entities/service.entity';
import { OrdersPolicy } from './policies/orders.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Customer,
      Provider,
      Service,
      ProviderService,
    ]),
    MapboxModule,
    AuthModule,
  ],
  providers: [OrdersService, OrdersPolicy],
  controllers: [OrdersController],
})
export class OrdersModule {}
