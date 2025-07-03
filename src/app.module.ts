import envConfig from '../config/env';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { AppMailerModule } from './mailer/mailer.module';
import { CosModule } from './cos/cos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [envConfig.path] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        ssl: { rejectUnauthorized: false },
        // synchronize: configService.get('NODE_ENV') !== 'prod',
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    PostsModule,
    UserModule,
    AuthModule,
    CategoryModule,
    TagModule,
    AppMailerModule,
    CosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
