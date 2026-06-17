import { Controller } from '@nestjs/common';
import { PlantService } from './plant.service';

@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}
}
