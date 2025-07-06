import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MapboxModule } from '../mapbox/mapbox.module';
import { Order } from './entities/order.entity';
import { ProviderService } from './entities/provider-services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, ProviderService]), MapboxModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
