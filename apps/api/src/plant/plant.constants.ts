// -------- Pick FlashPoint --------

export const P_LEAF = 0.8; // 葉ノード高さ優先ルートを選ぶ確率（0.0以上1.0以下）
export const MAX_CHILDREN = 4; // 子ノード数の上限

// ---------- Create Node ----------

export const MIN_HUE = 80;
export const BASE_HUE = 120;
export const HUE_DECAY_PER_DEPTH = 4;
export const MIN_SIZE = 3;
export const MIN_SIZE_RATIO = 0.65;
export const MAX_SIZE_RATIO = 0.88;

// ---------- Forest Fire ----------

// Forest Fire発生確率
export const P_FIRE = 0.4;

// NOTE: 下記２定数は size を揃えて最後を 0 にする
// 主エッジを通る隣接ノードの延焼発生確率
export const P_BURN_MAIN = [0.4, 0.3, 0.25, 0.2, 0.15, 0];
// 副エッジを通る隣接ノードの深さ毎の延焼発生確率
export const P_BURN_SUB = [0.18, 0.15, 0.1, 0.05, 0.01, 0];
