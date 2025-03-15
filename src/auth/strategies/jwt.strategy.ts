import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User | any> {
    try {
      const user = await this.userService.findByUsername(payload.username);

      return user;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException({
        error: {
          code: 'TOKEN_EXPIRED',
          message: '토큰이 만료되었습니다.',
        },
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
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
