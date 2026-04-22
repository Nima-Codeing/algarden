import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class SigninUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(20, { message: 'パスワードは20文字以内で入力してください' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '大文字、小文字、数字を組み合わせてください',
  })
  password: string;
}
