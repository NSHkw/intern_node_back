// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 회원가입
  async signup(signUpDto: SignUpDto) {
    return this.userService.create(signUpDto);
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
      });
    }

    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  // 토큰 확인
  async verifyToken(token: string) {
    try {
      const decodedToken = this.jwtService.verify(token);

      return { token, decodedToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          error: {
            code: 'TOKEN_EXPIRED',
            message: '토큰이 만료되었습니다.',
          },
        });
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          error: {
            code: 'INVALID_TOKEN',
            message: '토큰이 유효하지 않습니다.',
          },
        });
      } else {
        throw new UnauthorizedException({
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: '토큰이 없습니다.',
          },
        });
      }
    }
  }
}
