import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Repository } from 'typeorm';

import { AuthService } from '../auth.service';
import { User } from 'src/user/entities/user.entity';
import { RedisCacheService } from '../../db/redis-cache.service';

/**
 * JwtStrategy supports BOTH:
 *  - Web: HttpOnly cookie (access_token)
 *  - Mobile: Authorization: Bearer <token>
 *
 * Notes:
 *  - Make sure main.ts has `app.use(cookieParser())`
 *  - If calling from a different origin (e.g. Next.js dev server), enable CORS with credentials.
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1) Mobile / API clients
        ExtractJwt.fromAuthHeaderAsBearerToken(),

        // 2) Web (HttpOnly cookie)
        (req: Request) => (req as any)?.cookies?.['access_token'],
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,

      // Allow validate(req, payload)
      passReqToCallback: true,
    });
  }

  /**
   * Validate is executed after token signature/expiry verification.
   * We also cache the token in Redis keyed by user id (optional).
   */
  async validate(req: Request, payload: any) {
    // Re-extract token so we can cache it (Passport doesn't pass raw token by default)
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const tokenFromCookie = (req as any)?.cookies?.['access_token'];
    const token = tokenFromHeader ?? tokenFromCookie;

    const existUser = await this.authService.getUser(payload);
    if (!existUser) {
      throw new UnauthorizedException('Authentication failed');
    }

    if (token) {
      await this.redisCacheService.set(
        String(payload.id),
        token,
        this.configService.get('JWT_EXPIRY'),
      );
    }

    return existUser;
  }
}
