import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('create & return user', async () => {
      const signUpDto: SignUpDto = {
        username: 'test user',
        password: 'testPassword',
        nickname: 'test nickname',
      };
      const userServiceResponse = { username: 'test user', nickname: 'test nickname' };

      userService.create = jest.fn().mockResolvedValue(userServiceResponse);

      const result = await authService.signup(signUpDto);

      expect(result).toEqual(userServiceResponse);
      expect(userService.create).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('login', () => {
    it('login & return token', async () => {
      const loginDto: LoginDto = { username: 'test user', password: 'testPassword' };
      const user = { username: 'test user', password: 'hashedPassword', id: 1 };
      const token = 'jwt_token';

      userService.findByUsername = jest.fn().mockResolvedValue(user);
      jwtService.sign = jest.fn().mockReturnValue(token);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ token });
      expect(userService.findByUsername).toHaveBeenCalledWith(loginDto.username);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ username: user.username, sub: user.id });
    });

    it('login invalid', async () => {
      const loginDto: LoginDto = { username: 'test user', password: 'wrongPassword' };
      const user = { username: 'test user', password: 'hashedPassword' };

      userService.findByUsername = jest.fn().mockResolvedValue(user);
      jwtService.sign = jest.fn();

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByUsername).toHaveBeenCalledWith(loginDto.username);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });
  });
});
