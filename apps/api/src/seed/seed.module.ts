import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { GardenModule } from 'src/garden/garden.module';

@Module({
  imports: [GardenModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
