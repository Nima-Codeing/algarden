import { IsInt, Max, Min, ValidateIf } from 'class-validator';

export class UpdateTodoDurationDto {
  @ValidateIf((_o, value) => value !== null)
  @IsInt()
  @Min(600, {
    message:
      'The targetDuration is too short. Please set it to 10 minutes or more.',
  })
  @Max(28800, {
    message:
      'The targetDuration is too long. Please set it to 480 minutes (8 hours) or less.',
  })
  targetDuration: number | null;
}
