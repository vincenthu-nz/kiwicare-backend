import { compareSync } from 'bcryptjs';
import { User } from './entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(createUser: CreateUserDto) {
    const { email } = createUser;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userRepository.create(createUser);
    return await this.userRepository.save(newUser);
  }

  // async registerByWechat(userInfo: WechatUserInfo) {
  //   const { nickname, openid, head_img_url } = userInfo;
  //   const newUser = await this.userRepository.create({
  //     nickname,
  //     openid,
  //     avatar: head_img_url,
  //   });
  //   return await this.userRepository.save(newUser);
  // }

  //   async login(user: Partial<CreateUserDto>) {
  //     const { username, password } = user;

  //     const existUser = await this.userRepository
  //       .createQueryBuilder('user')
  //       .addSelect('user.password')
  //       .where('user.username=:username', { username })
  //       .getOne();

  //     console.log('existUser', existUser);
  //     if (
  //       !existUser ||
  //       !(await this.comparePassword(password, existUser.password))
  //     ) {
  //       throw new BadRequestException('用户名或者密码错误');
  //     }
  //     return existUser;
  //   }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async findByOpenid(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  comparePassword(password, libPassword) {
    return compareSync(password, libPassword);
  }
}
