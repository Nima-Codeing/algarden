import type { PlantNodeData } from "@algarden/shared";
import { mockPlant } from "../mockNodeData";

interface Coordinate {
  x: number;
  y: number;
  r: number;
  hue: number;
}

/**
 * 描画用にノード群の絶対座標を計算する。（極座標->絶対座標）
 *
 * @param {PlantNodeData[]} nodes - 極座標のノード群（DB取得時）
 * @returns {Map<string, Coordinate>} 絶対座標のノード群
 */
const calcCoord = (nodes: PlantNodeData[]): Map<string, Coordinate> => {
  const coordMap = new Map<string, Coordinate>();

  // ルートノードの計算
  const root = nodes.find((r) => r.parentId === null);
  if (!root)
    throw new Error(
      "ルートノードが見つかりませんでした。データが破損している可能性があります。",
    );
  coordMap.set(root.id, {
    x: 200,
    y: 200,
    r: root.size / 2,
    hue: root.hue,
  });

  // ルートノード以外の計算
  const sorted = [...nodes].sort((a, b) => a.depth - b.depth);
  sorted.forEach((node) => {
    // ルートスキップ
    if (node.parentId === null) return;
    // 親が計算済みか確認
    const parent = coordMap.get(node.parentId);
    if (!parent) return;

    if (node.length === null || node.angle === null) return;
    coordMap.set(node.id, {
      x: parent.x + node.length * Math.cos(node.angle),
      y: parent.y + node.length * Math.sin(node.angle),
      r: node.size / 2,
      hue: node.hue,
    });
  });

  return coordMap;
};

export const GardenCanvas = () => {
  const LINECOLOR = "#ffffff";
  const LIENSIZE = 1;
  const SATURATION = 80;
  const BRIGHTNESS = 65;
  const nodesData: PlantNodeData[] = mockPlant.plantNodes;
  const coordMap = calcCoord(nodesData);

  return (
    <svg
      className="border-4 border-purple-400 bg-mist-900"
      width="400"
      height="400"
      viewBox="0 0 400 400"
    >
      {nodesData.map((n, i) => {
          if(n.parentId === null) return; // ルート除外
          const from = coordMap.get(n.parentId);
          const to = coordMap.get(n.id);
          return (
            <line
              key={i}
              x1={from?.x}
              y1={from?.y}
              x2={to?.x}
              y2={to?.y}
              stroke={LINECOLOR}
              strokeWidth={LIENSIZE}
            />
          );
        })}
      {Array.from(coordMap.entries()).map(([id, n]) => (
        <circle
          key={id}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={`hsl(${n.hue} ${SATURATION}% ${BRIGHTNESS}%)`}
        />
      ))}
    </svg>
  );
};
