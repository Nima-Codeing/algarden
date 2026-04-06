// import {
//   IsInt,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   Max,
//   MaxLength,
//   Min,
//   MinLength,
// } from 'class-validator';

export class CreateTodoDto {
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(1)
  // @MaxLength(30)
  title: string;

  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // @Max(9999)
  targetDuration?: number;
}
