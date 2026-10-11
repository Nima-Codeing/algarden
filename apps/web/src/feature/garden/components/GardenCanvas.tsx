import type { PlantData } from "@algarden/shared";
import { useGarden } from "../api/queries";
import { Text } from "../../../components/ui/atoms/Text";

type FitArea = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type DrawableNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  fill: string;
};
type DrawableEdge = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};
type DrawablePlant = {
  id: string;
  nodes: DrawableNode[];
  edges: DrawableEdge[];
};

// カメラの枠（viewBox）の最小の大きさ。単位は庭の座標
const MIN_VIEW_SIZE = 400;
// ツリーの枠の外側に付ける余白（片側）。単位は庭の座標
const VIEW_PADDING = 20;

const SKELETON_EDGE_COLOR = "#ffffff";
const SPREAD_EDGE_COLOR = "#fd6969";
const EDGE_WIDTH = 1;
const SATURATION = 80;
const LIGHTNESS = 65;

/**
 * Plant 1つを、そのまま描ける形に変換する。
 * - ノード：Plantの中の座標に Seed の座標を足して、庭の座標にする
 * - エッジ：両端のノードの位置と色を決めておく
 * Seedの座標・ルート・エッジの端がないときは、データ破損としてエラーにする。
 */
const toDrawablePlant = (plant: PlantData): DrawablePlant => {
  const { id, seed, plantNodes, plantEdges } = plant;

  if (seed.x === null || seed.y === null)
    throw new Error(`Plant ${id}: Seedの座標がありません。`);

  if (!plantNodes.some((n) => n.parentId === null))
    throw new Error(`Plant ${id}: ルートノードがありません。`);

  const originX = seed.x;
  const originY = seed.y;

  // ノード：Plantの中の座標 -> 庭の座標
  const nodes = plantNodes.map((n) => ({
    id: n.id,
    x: n.x + originX,
    y: n.y + originY,
    r: n.size / 2,
    fill: `hsl(${n.hue} ${SATURATION}% ${LIGHTNESS}%)`,
  }));

  // エッジ：両端のノードの位置と、色を決めておく
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edges = plantEdges.flatMap((e) => {
    const from = nodeById.get(e.fromId);
    const to = nodeById.get(e.toId);

    if (!from || !to)
      throw new Error(`Plant ${id}: Edge ${e.id} の端のノードがありません。`);

    return [
      {
        id: e.id,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        color:
          e.edgeType === "SKELETON" ? SKELETON_EDGE_COLOR : SPREAD_EDGE_COLOR,
      },
    ];
  });

  return { id, nodes, edges };
};

/**
 * 全ノードがちょうど入る、一番小さい枠（ツリーの枠）を返す。
 * nodes は庭の座標に変換済みで、全Plantのノードを1本にまとめたもの。
 * 0件のときは原点だけの枠を返す（viewBox は原点を中央にした最小の大きさになる）。
 */
const calcFitArea = (nodes: DrawableNode[]): FitArea => {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x - n.r);
    minY = Math.min(minY, n.y - n.r);
    maxX = Math.max(maxX, n.x + n.r);
    maxY = Math.max(maxY, n.y + n.r);
  });

  return { minX, minY, maxX, maxY };
};

/** 余白、下限サイズを加えた viewBoxの範囲を返す */
const calcViewBox = (area: FitArea): ViewBox => {
  const width = Math.max(
    area.maxX - area.minX + VIEW_PADDING * 2,
    MIN_VIEW_SIZE,
  );
  const height = Math.max(
    area.maxY - area.minY + VIEW_PADDING * 2,
    MIN_VIEW_SIZE,
  );

  const centerX = (area.minX + area.maxX) / 2;
  const centerY = (area.minY + area.maxY) / 2;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
};

export const GardenCanvas = ({ className = "" }: { className?: string }) => {
  const { data: garden, isPending, isError } = useGarden();
  if (isPending) return <Text>loading...</Text>;
  if (isError) return <Text>Failed to load garden.</Text>;

  const plants = garden.plants.map(toDrawablePlant);
  const view = calcViewBox(calcFitArea(plants.flatMap((p) => p.nodes)));

  return (
    <div className={className}>
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {plants.map((plant) => (
          <g key={plant.id}>
            {plant.edges.map((e) => (
              <line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={e.color}
                strokeWidth={EDGE_WIDTH}
              />
            ))}
            {plant.nodes.map((n) => (
              <circle key={n.id} cx={n.x} cy={n.y} r={n.r} fill={n.fill} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};
