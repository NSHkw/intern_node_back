import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUser = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((dto) => dto),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUser },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('create user', async () => {
      const signUpDto = {
        username: 'test user',
        password: 'testPassword',
        nickname: 'test nickname',
      };

      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockReturnValue(signUpDto);
      mockUser.save.mockResolvedValue(signUpDto);

      const result = await userService.create(signUpDto);

      expect(mockUser.findOne).toHaveBeenCalledWith({ where: { username: 'test user' } });
      expect(mockUser.create).toHaveBeenCalledWith({
        username: 'test user',
        password: 'hashedPassword',
        nickname: 'test nickname',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ username: 'test user', nickname: 'test nickname' });
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 10);
    });

    it('conflictException: user already exists', async () => {
      const signUpDto = {
        username: 'existing',
        password: 'testPassword',
        nickname: 'test nickname',
      };

      mockUser.findOne.mockResolvedValue(signUpDto);

      await expect(userService.create(signUpDto)).rejects.toThrow(ConflictException);
      expect(mockUser.findOne).toHaveBeenCalledWith({ where: { username: 'existing' } });
    });
  });
});
