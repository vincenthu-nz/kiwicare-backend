import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/role.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provider')
export class ProvidersController {
  constructor(private readonly providerService: ProvidersService) {}

  @Roles('customer')
  @Get('nearby')
  async getNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
  ) {
    return this.providerService.findNearby(latitude, longitude, radius);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.providerService.findById(id);
  }
}
