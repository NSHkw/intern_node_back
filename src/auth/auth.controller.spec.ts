import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('signup controller success', async () => {
      const signUpDto: SignUpDto = {
        username: 'test user',
        password: 'testPassword',
        nickname: 'test nickname',
      };

      mockAuthService.signup.mockResolvedValue({
        username: 'test user',
        nickname: 'test nickname',
      });

      const result = await controller.signup(signUpDto);

      expect(result).toEqual({
        username: 'test user',
        nickname: 'test nickname',
      });
      expect(mockAuthService.signup).toHaveBeenCalledWith(signUpDto);
    });

    it('signup controller conflict', async () => {
      const signUpDto: SignUpDto = {
        username: 'existing',
        password: 'testPassword',
        nickname: 'test nickname',
      };

      mockAuthService.signup.mockRejectedValue(
        new UnauthorizedException('이미 가입된 사용자입니다.'),
      );

      await expect(controller.signup(signUpDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('login', () => {
    it('login controller success', async () => {
      const loginDto: LoginDto = {
        username: 'test user',
        password: 'testPassword',
      };

      mockAuthService.login.mockResolvedValue({
        token: 'jwt_token',
      });

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        token: 'jwt_token',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('login controller credentials', async () => {
      const loginDto: LoginDto = {
        username: 'invalid user',
        password: 'testPassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('verifyToken', () => {
    it('verifyToken controller success', async () => {
      const token = 'valid_token';
      const decodedToken = {
        username: 'test user',
        sub: 1,
        iat: 1630303020,
        exp: 1630389420,
      };

      mockAuthService.verifyToken.mockResolvedValue({
        token,
        decodedToken,
      });

      const result = await controller.verifyToken(token);

      expect(result).toEqual({
        token,
        decodedToken,
      });
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
    });

    it('verifyToken controller invalid', async () => {
      const token = 'invalid_token';

      mockAuthService.verifyToken.mockRejectedValue(
        new UnauthorizedException('토큰이 유효하지 않습니다.'),
      );

      await expect(controller.verifyToken(token)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
    });
  });
});
