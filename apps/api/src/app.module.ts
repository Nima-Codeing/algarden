import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GardenModule } from './garden/garden.module';
import { SeedModule } from './seed/seed.module';
import { PlantModule } from './plant/plant.module';

@Module({
  imports: [
    PrismaModule,
    TodoModule,
    AuthModule,
    GardenModule,
    SeedModule,
    PlantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
