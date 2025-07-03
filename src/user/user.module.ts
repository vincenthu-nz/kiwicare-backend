import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PendingUser } from './entities/pending-users.entity';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, PendingUser]), AppMailerModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
