import type { PlantData, PlantNodeData } from "@algarden/shared";

interface Coordinate {
  x: number;
  y: number;
  r: number;
  hue: number;
}

type Props = {
  plants: PlantData[] | undefined;
};

/**
 * Plant内ローカル座標を描画用のキャンバス座標へ平行移動する。
 *
 * PlantNode.x/y はルートノードを原点とするPlant内の相対座標。
 * 描画時にPlantの配置位置を加算して絶対座標にする。
 * ORIGIN は暫定値で、将来はSeedのx/yに置き換わる。
 *
 * @param {PlantNodeData[]} nodes - Plant内ローカル座標のノード群
 * @returns {Map<string, Coordinate>} キャンバス座標のノード群
 */
const calcCoord = (nodes: PlantNodeData[]): Map<string, Coordinate> => {
  const ORIGIN_X = 200;
  const ORIGIN_Y = 200;
  const coordMap = new Map<string, Coordinate>();

  // ルートノードの存在確認（データ破損検知）
  const root = nodes.find((r) => r.parentId === null);
  if (!root)
    throw new Error(
      "ルートノードが見つかりませんでした。データが破損している可能性があります。",
    );

  nodes.forEach((node) => {
    coordMap.set(node.id, {
      x: node.x + ORIGIN_X,
      y: node.y + ORIGIN_Y,
      r: node.size / 2,
      hue: node.hue,
    });
  });

  return coordMap;
};

export const GardenCanvas = ({ plants }: Props) => {
  const LINECOLOR = "#ffffff";
  const LINESIZE = 1;
  const SATURATION = 80;
  const BRIGHTNESS = 65;

  return (
    <svg
      className="border-4 border-purple-400 bg-mist-900"
      width="400"
      height="400"
      viewBox="0 0 400 400"
    >
      {
        // Plant単位で描画する
        (plants ?? []).map((plant) => {
          const coordMap = calcCoord(plant.plantNodes);

          return (
            <g key={plant.id}>
              {plant.plantNodes.map((n) => {
                if (n.parentId === null) return null; // ルート除外
                const from = coordMap.get(n.parentId);
                const to = coordMap.get(n.id);
                return (
                  <line
                    key={n.id}
                    x1={from?.x}
                    y1={from?.y}
                    x2={to?.x}
                    y2={to?.y}
                    stroke={LINECOLOR}
                    strokeWidth={LINESIZE}
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
            </g>
          );
        })
      }
    </svg>
  );
};
