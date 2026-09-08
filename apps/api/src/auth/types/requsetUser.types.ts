import { UserData } from '@algarden/shared';
import { Assert, Jsonify } from 'src/common/types/contract.types';

export type RequestUser = { id: string; name: string };

// 共通型の項目が不足していないか
export type RequestUserContract = Assert<UserData, Jsonify<RequestUser>>;

// 共通型にない項目を余分に転送していないか
export type RequestUserContractNoExcess = Assert<
  Jsonify<RequestUser>,
  UserData
>;
