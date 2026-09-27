import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(600, {
    message:
      'The targetDuration is too short. Please set it to 10 minutes or more.',
  }) // 10分
  @Max(28800, {
    message:
      'The targetDuration is too long. Please set it to 480 minutes (8 hours) or less.',
  }) // 8時間
  targetDuration?: number;
}
