import { Controller } from '@nestjs/common';
import { GardenService } from './garden.service';

@Controller('garden')
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}
}
