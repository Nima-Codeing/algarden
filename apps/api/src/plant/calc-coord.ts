import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3-force';

import { PlantEdge, PlantNode } from '../../generated/prisma/client';
import {
  LAYOUT_ALPHA,
  LAYOUT_CHARGE_STRENGTH,
  LAYOUT_HOPS,
  LAYOUT_LINK_DISTANCE,
  LAYOUT_LINK_STRENGTH,
  LAYOUT_TICKS,
} from './plant.constants';

type CoordNodeInput = Pick<PlantNode, 'id' | 'x' | 'y' | 'size' | 'parentId'>;
type CoordEdgeInput = Pick<PlantEdge, 'fromId' | 'toId'>;

interface CoordNode extends SimulationNodeDatum {
  id: string;
  size: number;
  x: number;
  y: number;
}
type CoordLink = SimulationLinkDatum<CoordNode>;

export type CalcCoordResult = {
  id: string;
  x: number;
  y: number;
};

/**
 * 起点ノードから hops 以内のノードIDを幅優先探索で集める
 * エッジの向きは考慮しない
 *
 * @param {CoordEdgeInput[]} edges - Plant内の全エッジ
 * @param {string} startId - 起点ノードのid
 * @param {number} hops - 何ホップ先まで集めるか
 * @returns {Set<string>} 起点を含む hops 以内のノードid
 */
const collectNearIds = (
  edges: CoordEdgeInput[],
  startId: string,
  hops: number,
): Set<string> => {
  const nearIds = new Set([startId]);
  let frontier = new Set([startId]);

  for (let i = 0; i < hops; i++) {
    const next = new Set<string>();

    for (const { fromId, toId } of edges) {
      if (frontier.has(fromId) && !nearIds.has(toId)) next.add(toId);
      if (frontier.has(toId) && !nearIds.has(fromId)) next.add(fromId);
    }

    next.forEach((id) => nearIds.add(id));
    frontier = next;
  }

  return nearIds;
};

/**
 * 新ノードの周りを d3-force で動かし、動かしたノードの座標を返す
 *
 * - 新ノードから LAYOUT_HOPS 以内だけを動かし、それ以外は今の座標に固定する
 * - ルートは Plant 内の原点（Seed の位置）なので、常に (0, 0) に固定し、返さない
 *
 * @param {CoordNodeInput[]} nodes - Plant内の全ノード（新ノードを含む）
 * @param {CoordEdgeInput[]} edges - Plant内の全エッジ（新ノードの主エッジ・延焼エッジを含む）
 * @param {string} newId - 新ノードのid
 * @returns {CalcCoordResult[]} 動かしたノードの座標
 */
export const calcCoord = (
  nodes: CoordNodeInput[],
  edges: CoordEdgeInput[],
  newId: string,
): CalcCoordResult[] => {
  const nearIds = collectNearIds(edges, newId, LAYOUT_HOPS);
  const isMovable = (n: CoordNodeInput) =>
    n.parentId !== null && nearIds.has(n.id);

  // 動かさないノードを fx / fy で固定
  const coordNodes: CoordNode[] = nodes.map((n) => {
    if (n.parentId === null)
      return { id: n.id, size: n.size, x: 0, y: 0, fx: 0, fy: 0 }; // ルートノード
    if (!isMovable(n))
      return { id: n.id, size: n.size, x: n.x, y: n.y, fx: n.x, fy: n.y }; // ホップ外ノード
    return { id: n.id, size: n.size, x: n.x, y: n.y };
  });

  // NOTE: d3 が source / target をノードの参照に書き換えるため、edges とは別の配列を渡す
  const links: CoordLink[] = edges.map((e) => ({
    source: e.fromId,
    target: e.toId,
  }));

  forceSimulation<CoordNode, CoordLink>(coordNodes)
    .alpha(LAYOUT_ALPHA)
    .alphaDecay(1 - Math.pow(0.001, 1 / LAYOUT_TICKS))
    .force(
      'link',
      forceLink<CoordNode, CoordLink>(links)
        .id((d) => d.id)
        .distance(LAYOUT_LINK_DISTANCE)
        .strength(LAYOUT_LINK_STRENGTH),
    )
    .force(
      'change',
      forceManyBody<CoordNode>().strength(LAYOUT_CHARGE_STRENGTH),
    )
    .force(
      'collide',
      forceCollide<CoordNode>((d) => d.size / 2),
    )
    .stop()
    .tick(LAYOUT_TICKS);

  const movableIds = new Set(nodes.filter(isMovable).map((n) => n.id));

  return coordNodes
    .filter((n) => movableIds.has(n.id))
    .map(({ id, x, y }) => ({ id, x, y }));
};
