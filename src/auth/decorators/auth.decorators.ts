import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../guards/role.guard';

export function ProviderOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('provider'),
  );
}
