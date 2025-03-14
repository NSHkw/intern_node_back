import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationJoiSchema } from 'configs/env-validation.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configModuleValidationJoiSchema }),
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
