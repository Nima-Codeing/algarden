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
  @Min(60) // 1分
  @Max(43200) // 12時間
  targetDuration?: number;
}
