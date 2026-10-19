import { plainToInstance } from 'class-transformer';
import { SigninUserDto } from './signin-user.dto';
import { validateSync } from 'class-validator';

describe('SigninUserDto', () => {
  // -------------------
  //  引数生成ヘルパー関数
  // -------------------
  const check = (signInUser: { email?: string; password?: string }) => {
    const dto = plainToInstance(SigninUserDto, signInUser);
    const errors = validateSync(dto);
    return { dto, errors };
  };

  it('正常系: サインイン時はパスワードの強度チェック(@IsStrongPassword)がないこと', () => {
    const { errors } = check({
      email: 'test@example.com',
      password: 'weakpassword',
    });

    expect(errors).toHaveLength(0);
  });

  it('正常系: 前後に空白がある場合、空白を削った値になる', () => {
    const { dto, errors } = check({
      email: ' test@example.com ',
      password: ' Password.AAA ',
    });

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('test@example.com');
    expect(dto.password).toBe('Password.AAA');
  });

  it('異常系: 空白だけのパスワードはエラーになること', () => {
    const { errors } = check({
      email: 'test@example.com',
      password: '              ',
    });

    expect(errors).toHaveLength(1);
    expect(errors.map((e) => e.property)).toEqual(['password']);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('異常系: DTOの継承(OmitType)後も、メールアドレスの形式でなければエラーになること', () => {
    const { errors } = check({
      email: 'test.example.com',
      password: 'Password.AAA',
    });

    expect(errors).toHaveLength(1);
    expect(errors.map((e) => e.property)).toEqual(['email']);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });
});
