import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Roles } from '../auth/guards/role.guard';
import { ProviderOnly } from '../auth/decorators/auth.decorators';

@ProviderOnly()
@Controller('providers')
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
