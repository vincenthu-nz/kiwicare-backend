import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { RolesGuard } from '../auth/role.guard';

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

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async cancelOrder(
    @Param('id') id: string,
    @Req() req,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(req.user, id, cancelDto);
  }
}
