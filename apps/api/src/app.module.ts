import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GardenModule } from './garden/garden.module';
import { PlantModule } from './plant/plant.module';

@Module({
  imports: [PrismaModule, TodoModule, AuthModule, GardenModule, PlantModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
