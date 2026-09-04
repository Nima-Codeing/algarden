// Json化後の型算出
export type Jsonify<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonify<U>[]
    : T extends object
      ? { [V in keyof T]: Jsonify<T[V]> }
      : T;

// 型一致確認
export type Assert<A, B extends A> = B;
