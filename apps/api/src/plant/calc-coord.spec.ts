import { calcCoord } from './calc-coord';
import { LAYOUT_LINK_DISTANCE } from './plant.constants';

describe('calcCoord', () => {
  // -------------------
  //  引数生成ヘルパー関数
  // -------------------
  // root - n1 - n2 - ... - n{length} の一本道（間隔30）。最後のノードを新ノードとして扱う
  const chain = (length: number) => {
    const ids = ['root', ...Array.from({ length }, (_, i) => `n${i + 1}`)];
    const nodes = ids.map((id, i) => ({
      id,
      x: i * 30,
      y: 0,
      size: i === 0 ? 20 : 8,
      parentId: i === 0 ? null : ids[i - 1],
    }));
    const edges = ids.slice(1).map((id, i) => ({ fromId: ids[i], toId: id }));
    return { nodes, edges, newId: ids[ids.length - 1] };
  };

  it('正常系: 新ノードから2ホップ以内のノードだけを返す。庭の大部分を動かさない設計のため', () => {
    const { nodes, edges, newId } = chain(6);

    const ids = calcCoord(nodes, edges, newId).map((r) => r.id);

    expect(ids.sort()).toEqual(['n4', 'n5', 'n6']);
  });

  it('正常系: 動かしたノードと固定したノードの境目のエッジが伸びすぎない。固定が計算の前に効いているか確かめるため', () => {
    const { nodes, edges, newId } = chain(6);

    const n4 = calcCoord(nodes, edges, newId).find((r) => r.id === 'n4')!;
    const n3 = nodes.find((n) => n.id === 'n3')!; // 2ホップの外なのでDBの座標のまま

    const length = Math.hypot(n4.x - n3.x, n4.y - n3.y);
    expect(length).toBeLessThan(LAYOUT_LINK_DISTANCE * 2);
  });

  it('正常系: ルートは2ホップ以内でも返さない。Seed の位置とずれないようにするため', () => {
    const { nodes, edges, newId } = chain(2);

    const ids = calcCoord(nodes, edges, newId).map((r) => r.id);

    expect(ids.sort()).toEqual(['n1', 'n2']);
  });
});
