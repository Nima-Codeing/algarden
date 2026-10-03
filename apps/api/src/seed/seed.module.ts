import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { DateModule } from 'src/common/date/date.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [DateModule],
})
export class SeedModule {}
