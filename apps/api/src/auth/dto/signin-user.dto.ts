import { OmitType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class SigninUserDto extends OmitType(CreateUserDto, [
  'name',
  'password',
] as const) {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Please enter your password.' })
  password: string;
}
