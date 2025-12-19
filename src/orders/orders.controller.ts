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
import { ApiOperation } from '@nestjs/swagger';
import { ClosureOrderDto } from './dto/closure-order.dto';
import { StartOrderDto } from './dto/start-order.dto';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProviderOnly } from '../auth/decorators/auth.decorators';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create orders' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user, dto);
  }

  @ApiOperation({ summary: 'Cancel orders' })
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Param('id') id: string,
    @Req() req,
    @Body() cancelDto: ClosureOrderDto,
  ) {
    return this.ordersService.cancelOrder(req.user, id, cancelDto);
  }

  @ApiOperation({ summary: 'Reject orders' })
  @Patch(':id/reject')
  @ProviderOnly()
  async rejectOrder(
    @Param('id') id: string,
    @Req() req,
    @Body() rejectDto: ClosureOrderDto,
  ) {
    return this.ordersService.rejectOrder(req.user, id, rejectDto);
  }

  @ApiOperation({ summary: 'Get my orders' })
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @Req() req,
    @Query('status') status?: string,
    @Query('page') page = 1,
  ) {
    return this.ordersService.getMyOrders(req.user, status, +page);
  }

  @ApiOperation({ summary: 'Accept orders' })
  @Patch(':id/accept')
  @ProviderOnly()
  async acceptOrder(@Req() req, @Param('id') id: string) {
    return this.ordersService.acceptOrder(req.user, id);
  }

  @ApiOperation({ summary: 'Start orders' })
  @Patch(':id/start')
  @ProviderOnly()
  async startOrder(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: StartOrderDto,
  ) {
    return this.ordersService.startOrder(req.user, id, dto);
  }

  @ApiOperation({ summary: 'Complete orders' })
  @Patch(':id/complete')
  @ProviderOnly()
  async completeOrder(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CompleteOrderDto,
  ) {
    return this.ordersService.completeOrder(req.user, id, dto);
  }

  @ApiOperation({ summary: 'Comment orders' })
  @Post(':id/review')
  @UseGuards(JwtAuthGuard)
  async addReview(
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.ordersService.addReview(id, userId, dto);
    return { message: 'Review submitted' };
  }
}
