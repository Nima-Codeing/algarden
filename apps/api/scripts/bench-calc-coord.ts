import { randomUUID } from 'node:crypto';
import { buildLargeGarden } from '../prisma/fixtures/large-garden';
import { calcCoord } from '../src/plant/calc-coord';

const RUNS = 5;

/** ノード 300個 / 1000個 の場合のシミュレート処理時間をはかる */
for (const count of [300, 1000]) {
  const times: number[] = [];
  for (let run = 0; run < RUNS; run++) {
    const { nodes, edges } = buildLargeGarden('bench', count);
    // 末尾のノードを親にして、新ノードを1つ足す（1回のループで生える1ノード分）
    const parent = nodes[nodes.length - 1];
    const newNode = {
      ...parent,
      id: randomUUID(),
      x: parent.x + 15,
      parentId: parent.id,
      depth: parent.depth + 1,
    };
    nodes.push(newNode);
    edges.push({ ...edges[0], fromId: parent.id, toId: newNode.id });

    const start = performance.now();
    calcCoord(nodes, edges, newNode.id);
    times.push(performance.now() - start);
  }
  const sorted = [...times].sort((a, b) => a - b);
  console.log(
    `${count}ノード: 中央値 ${sorted[Math.floor(RUNS / 2)].toFixed(0)}ms`,
  );
}
