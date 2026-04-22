import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'ユーザーネームは4文字以上にしてください。' })
  @MaxLength(12, { message: 'ユーザーネームは12文字以下にしてください。' })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(20, { message: 'パスワードは20文字以内で入力してください' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '大文字、小文字、数字を組み合わせてください',
  })
  password: string;
}
