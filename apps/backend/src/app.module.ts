import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GardenModule } from './garden/garden.module';

@Module({
  imports: [PrismaModule, TodoModule, AuthModule, GardenModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
