import type { PlantNodeData } from "@algarden/shared";
import { mockPlant } from "../mockNodeData";

interface Coordinate {
  x: number;
  y: number;
  r: number;
  hue: string;
}

const calcCoord = (nodes: PlantNodeData[]): Map<string, Coordinate> => {
  const coordMap = new Map<string, Coordinate>();

  // ルートノードの初期位置
  const root = nodes.find((n) => n.parentId === null);
  if (root) {
    coordMap.set(root.id, { x: 100, y: 100, r: root.size / 2, hue: root.hue.toString() });
  }

  // 親ノードが計算済みのものから順に座標を確定させる
  // （データがID順に依存関係通りに並んでいる前提、またはトポロジカルソートが必要）
  nodes.forEach((node) => {
    if (node.parentId === null) return;

    const parentCoord = coordMap.get(node.parentId);
    if (!parentCoord) return;

    // 問題3の対策：ラジアンを使用して計算
    const rad = (node.angle! * Math.PI) / 180; // 度数からラジアンへの変換（モック側で直さない場合）

    const x = parentCoord.x + node.length! * Math.cos(rad);
    const y = parentCoord.y + node.length! * Math.sin(rad);
    const r = parentCoord.r / 2;
    const hue = parentCoord.hue;

    coordMap.set(node.id, { x, y, r, hue });
  });

  return coordMap;
};

export const GardenCanvas = () => {
  const SATURATION = 80;
  const BRIGHTNESS = 65;
  const nodesData: PlantNodeData[] = mockPlant.plantNodes;
  const coordMap = calcCoord(nodesData);

  console.log(coordMap);

  return (
    <svg
      className="border-4 border-purple-400 bg-mist-900"
      width="200"
      height="200"
      viewBox="0 0 400 400"
    >
      {Array.from(coordMap.entries()).map(([id, coord]) => (
        <circle key={id} cx={coord.x} cy={coord.y} r={coord.r} fill={`hsl(${coord.hue} ${SATURATION}% ${BRIGHTNESS}%)`} />
      ))}
    </svg>
  );

  //   return (
  //     <svg
  //       className="border-4 border-purple-400 bg-mist-900"
  //       width="200"
  //       height="200"
  //       viewBox="0 0 400 400"
  //     >
  //       {mockPlant.map((node) => {
  //         const ccurent;
  //       })}
  {
    /* {data.plantNodes.map((n) => {
        const c = {
          key: n.id,
          cx: parent ? parent.x + n.length! * Math.cos(n.angle!) : 0,
          cy: parent ? parent.y + n.length! * Math.sin(n.angle!) : 0,
          r: n.size / 2,
          fill: `hsl(${n.hue} ${SATURATION}% ${BRIGHTNESS}%)`,
        };

        setParent({
          ...n,
          x: c.cx,
          y: c.cy,
        });

        return <circle key={c.key} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />;
      })} */
  }
  //     </svg>
  //   );
};
