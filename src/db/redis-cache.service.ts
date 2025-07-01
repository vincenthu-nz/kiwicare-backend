import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisCacheService {
  constructor(@Inject('REDIS_CLIENT') private redisClient: RedisClientType) {}

  async get<T = any>(key: string): Promise<T | null> {
    const raw = (await this.redisClient.get(key)) as string | null;
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set(key: string, value: any, second?: number) {
    value = JSON.stringify(value);
    return await this.redisClient.set(key, value, { EX: second });
  }

  async delete(key: string) {
    return await this.redisClient.del(key);
  }

  async flushAll() {
    return await this.redisClient.flushAll();
  }
}
