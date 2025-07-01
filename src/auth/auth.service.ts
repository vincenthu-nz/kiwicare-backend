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

  async login(user: Partial<User>) {
    const token = await this.createToken({
      id: user.id,
      email: user.email,
      role: user.role,
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

  // async getUserInfo() {
  //   const result: AxiosResponse<WechatError & WechatUserInfo> =
  //     await lastValueFrom(
  //       this.httpService.get(
  //         `${this.apiServer}/sns/userinfo?access_token=${this.accessTokenInfo.accessToken}&openid=${this.accessTokenInfo.openid}`,
  //       ),
  //     );
  //   if (result.data.errcode) {
  //     throw new BadRequestException(
  //       `[getUserInfo] errcode:${result.data.errcode}, errmsg:${result.data.errmsg}`,
  //     );
  //   }
  //   console.log('result', result.data);
  //
  //   return result.data;
  // }
  //
  // async getAccessToken(code) {
  //   const { APPID, APPSECRET } = process.env;
  //   if (!APPSECRET) {
  //     throw new BadRequestException('[getAccessToken]必须有appSecret');
  //   }
  //   if (
  //     !this.accessTokenInfo ||
  //     (this.accessTokenInfo && this.isExpires(this.accessTokenInfo))
  //   ) {
  //     // 请求accessToken数据
  //     const res: AxiosResponse<WechatError & AccessConfig, any> =
  //       await lastValueFrom(
  //         this.httpService.get(
  //           `${this.apiServer}/sns/oauth2/access_token?appid=${APPID}&secret=${APPSECRET}&code=${code}&grant_type=authorization_code`,
  //         ),
  //       );
  //
  //     if (res.data.errcode) {
  //       throw new BadRequestException(
  //         `[getAccessToken] errcode:${res.data.errcode}, errmsg:${res.data.errmsg}`,
  //       );
  //     }
  //     this.accessTokenInfo = {
  //       accessToken: res.data.access_token,
  //       expiresIn: res.data.expires_in,
  //       getTime: Date.now(),
  //       openid: res.data.openid,
  //     };
  //   }
  //
  //   return this.accessTokenInfo.accessToken;
  // }

  isExpires(access) {
    return Date.now() - access.getTime > access.expiresIn * 1000;
  }
}
