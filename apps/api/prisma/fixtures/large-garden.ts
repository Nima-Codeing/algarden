import { randomUUID } from 'node:crypto';

import { EdgeType } from '../../generated/prisma/client';

type FixtureNode = {
  id: string;
  x: number;
  y: number;
  hue: number;
  size: number;
  depth: number;
  parentId: string | null;
  plantId: string;
};

type FixtureEdge = {
  fromId: string;
  toId: string;
  edgeType: EdgeType;
  plantId: string;
};

/**
 * 同じ種なら毎回同じ値を返す乱数（初期値seed を入れ直しても同じ庭になる）
 * 参考: Mulberry32 Algorithm
 */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * 自動フィット確認用の、ノードが多く片寄って広がった庭。
 * 蔓が右上へ偏って伸びるので、ルート（Seed）ではなくツリー全体が中央に来るかを確かめられる。
 * todoId は付けない（表示の確認用で、Todo との対応は持たない）。
 */
export const buildLargeGarden = (plantId: string, nodeCount = 300) => {
  const random = createRandom(42);

  const root: FixtureNode = {
    id: randomUUID(),
    x: 0,
    y: 0,
    hue: 120,
    size: 10,
    depth: 0,
    parentId: null,
    plantId,
  };
  const nodes: FixtureNode[] = [root];
  const edges: FixtureEdge[] = [];

  for (let i = 1; i < nodeCount; i++) {
    // 基本は直前のノードから伸ばし、15% の確率で既存のノードから枝分かれする
    const parent =
      random() < 0.15
        ? nodes[Math.floor(random() * nodes.length)]
        : nodes[i - 1];

    // 右上（-30°）を中心に ±120° 揺らす
    // NOTE: SVGでは yが下向きなので、マイナスが上
    const angle = -Math.PI / 6 + ((random() - 0.5) * (Math.PI * 4)) / 3; // 参考: Linear Interpolation
    const length = 10 + random() * 10;
    const depth = parent.depth + 1;

    const node: FixtureNode = {
      id: randomUUID(),
      x: parent.x + Math.cos(angle) * length,
      y: parent.y + Math.sin(angle) * length,
      hue: Math.max(80, 120 - depth * 4),
      size: 6,
      depth,
      parentId: parent.id,
      plantId,
    };

    nodes.push(node);
    edges.push({
      fromId: parent.id,
      toId: node.id,
      edgeType: EdgeType.SKELETON,
      plantId,
    });
  }

  return { nodes, edges };
};
