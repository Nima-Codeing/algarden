import { UserData } from '@algarden/shared';
import { Prisma } from 'generated/prisma/client';

import { Assert, Jsonify } from 'src/common/types/contract.types';

export type JwtPayload = {
  sub: string;
  username: string;
};

export const userSelect = {
  id: true,
  name: true,
} as const satisfies Prisma.UserSelect;
export type UserResponse = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

// 項目の 不足 / 余分 チェック
export type UserResponseContract = Assert<UserData, Jsonify<UserResponse>>;
export type UserResponseContractNoExcess = Assert<
  Jsonify<UserResponse>,
  UserData
>;

export type RequestUser = { id: string; name: string };

// 項目の 不足 / 余分 チェック
export type RequestUserContract = Assert<UserData, Jsonify<RequestUser>>;
export type RequestUserContractNoExcess = Assert<
  Jsonify<RequestUser>,
  UserData
>;
