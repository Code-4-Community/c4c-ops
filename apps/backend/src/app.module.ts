import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PluralNamingStrategy } from './strategies/plural-naming.strategy';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NX_DB_HOST,
      port: 5432,
      username: process.env.NX_DB_USERNAME,
      password: process.env.NX_DB_PASSWORD,
      autoLoadEntities: true,
      // entities: [join(__dirname, '**/**.entity.{ts,js}')],
      // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data
      synchronize: true,
      namingStrategy: new PluralNamingStrategy(),
    }),
    AuthModule,
    UsersModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
