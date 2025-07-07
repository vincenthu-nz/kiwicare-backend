import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { ClosureOrderDto } from './dto/closure-order.dto';
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

  @ApiOperation({ summary: 'Cancel orders' })
  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async cancelOrder(
    @Param('id') id: string,
    @Req() req,
    @Body() cancelDto: ClosureOrderDto,
  ) {
    return this.ordersService.cancelOrder(req.user, id, cancelDto);
  }

  @ApiOperation({ summary: 'Reject orders' })
  @Patch(':id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async rejectOrder(
    @Param('id') id: string,
    @Req() req,
    @Body() rejectDto: ClosureOrderDto,
  ) {
    return this.ordersService.rejectOrder(req.user, id, rejectDto);
  }

  @ApiOperation({ summary: 'Get my orders' })
  @Get('my')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getMyOrders(
    @Req() req,
    @Query('status') status?: string,
    @Query('page') page = 1,
  ) {
    return this.ordersService.getMyOrders(req.user, status, +page);
  }
}
