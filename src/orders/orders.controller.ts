import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create orders' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    const customerId = req.body.customerId;
    return this.ordersService.createOrder(customerId, dto);
  }
}
