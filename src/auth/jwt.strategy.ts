import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { RedisCacheService } from '../db/redis-cache.service';

export class JwtStorage extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(req, payload: Partial<User>) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const cacheToken = await this.redisCacheService.get(`${payload.id}`);

    if (!cacheToken) {
      throw new UnauthorizedException('Authentication failed');
    }

    if (token != cacheToken) {
      throw new UnauthorizedException('You have logged in from another device');
    }

    const existUser = await this.authService.getUser(payload);
    if (!existUser) {
      throw new UnauthorizedException('Authentication failed');
    }

    await this.redisCacheService.set(
      `${payload.id}`,
      token,
      this.configService.get('JWT_EXPIRY'),
    );

    return existUser;
  }
}
