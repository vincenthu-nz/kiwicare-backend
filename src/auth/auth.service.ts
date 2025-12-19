import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { AccessTokenInfo } from './auth.interface';
import { RedisCacheService } from '../db/redis-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private accessTokenInfo: AccessTokenInfo;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  async createToken(payload: {
    id: string;
    email: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async issueTokens(user: Partial<User>) {
    const token = await this.createToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });

    await this.redisCacheService.set(
      `${user.id}`,
      token,
      this.configService.get('JWT_EXPIRY'),
    );

    return { token };
  }

  async getUser(user) {
    return await this.userService.findOne(user.id);
  }

  async getUserByOpenid() {
    return await this.userService.findByOpenid(this.accessTokenInfo.openid);
  }
}
