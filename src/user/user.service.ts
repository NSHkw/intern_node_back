import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async create(
    signUpDto: SignUpDto,
  ): Promise<Partial<User> | { error: { code: string; message: string } }> {
    const { username, password, nickname } = signUpDto;

    const existingUser = await this.findByUsername(username);

    if (existingUser) {
      throw new ConflictException({
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: '이미 가입된 사용자입니다.',
        },
      });
    }

    const hashRound = this.config.get<number>('HASH_ROUND');
    Logger.log(hashRound);
    Logger.log(typeof hashRound);

    const hashedPassword = await bcrypt.hash(password, hashRound);
    Logger.log(hashRound);

    const user = this.userRepository.create({ username, password: hashedPassword, nickname });

    await this.userRepository.save(user);

    return { username: user.username, nickname: user.nickname };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }
}
