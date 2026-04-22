import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  return hash;
}
