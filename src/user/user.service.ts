import { User } from './entities/user.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { PendingUser } from './entities/pending-users.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PendingUser)
    private readonly pendingUserRepository: Repository<PendingUser>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'Email is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Delete any existing pending user record with the same email
    await this.pendingUserRepository.delete({ email });

    const verifyToken = randomUUID();

    const hashedPassword = await bcrypt.hash(password, 10);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const pendingUser = this.pendingUserRepository.create({
      email,
      password: hashedPassword,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      token: verifyToken,
      expiresAt,
    });

    await this.pendingUserRepository.save(pendingUser);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/verify-email?token=${verifyToken}`;

    await this.mailerService.sendVerificationEmail(
      email,
      firstName,
      verificationLink,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async findByOpenid(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const allowedFields = ['phone', 'birthday', 'city'];
    for (const field of allowedFields) {
      if (field in updateUserDto) {
        user[field] = updateUserDto[field];
      }
    }

    const updatedUser = await this.userRepository.save(user);
    return instanceToPlain(updatedUser);
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
