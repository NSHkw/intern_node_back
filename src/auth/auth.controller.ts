// src/auth/auth.controller.ts
import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: 'username, password, nickname을 입력하세요.' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 가입된 사용자입니다.' })
  signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

  // 로그인
  @Post('login')
  @ApiOperation({ summary: '로그인인', description: 'username, password를를 입력하세요.' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 토큰 확인
  @ApiBearerAuth()
  @ApiOperation({
    summary: '토큰 확인',
    description: '헤더에 토큰 입력 시 토큰의 상태를 확인할 수 있습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 상태 확인',
    example: {
      token: 'your-token',
      decodedToken: {
        username: 'user123',
        sub: 123, // id
        iat: 1630303020,
        exp: 1630389420,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '토큰 사용 기간 만료',
    example: {
      error: {
        code: 'TOKEN_EXPIRED',
        message: '토큰이 만료되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '잘못된 토큰',
    example: {
      error: {
        code: 'INVALID_TOKEN',
        message: '토큰이 유효하지 않습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '토큰이 없습니다.',
    example: {
      error: {
        code: 'TOKEN_NOT_FOUND',
        message: '토큰이 없습니다.',
      },
    },
  })
  @Get('verify')
  verifyToken(@Headers('TOKEN') token: string) {
    return this.authService.verifyToken(token);
  }
}
