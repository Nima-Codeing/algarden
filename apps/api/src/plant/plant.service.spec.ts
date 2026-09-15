import { Test, TestingModule } from '@nestjs/testing';
import { PlantService } from './plant.service';
import { CreatedEdge, NodeWithChildIds } from './types/plant.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { EdgeType, Prisma } from 'generated/prisma/client';

describe('PlantService', () => {
  let service: PlantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<PlantService>(PlantService);
  });

  describe('calcHeights', () => {
    // -------------------
    //  引数生成ヘルパー関数
    // -------------------
    const node = (
      id: string,
      depth: number,
      childIds: string[] = [],
    ): NodeWithChildIds => ({
      id,
      depth,
      children: childIds.map((childId) => ({ id: childId })),
    });

    it('プラントのノードが１つだけの場合、高さが０になる', () => {
      const nodes: NodeWithChildIds[] = [node('R', 0)];

      const heights: Map<string, number> = service.calcHeights(nodes);

      expect(heights.get('R')).toBe(0);
    });

    it('葉ノードの深さが違うプラントの場合、収束ノードの高さが子ノード内高さの最大数＋１になる', () => {
      const nodes: NodeWithChildIds[] = [
        node('R', 0, ['A', 'B']),
        node('A', 1, ['C']),
        node('B', 1),
        node('C', 2),
      ];

      const heights: Map<string, number> = service.calcHeights(nodes);

      expect(heights.get('R')).toBe(2);
      expect(heights.get('A')).toBe(1);
      expect(heights.get('B')).toBe(0);
      expect(heights.get('C')).toBe(0);
    });

    it('ノードが空の場合、空のMapを返す', () => {
      expect(service.calcHeights([]).size).toBe(0);
    });

    it('引数を渡した場合、引数配列が変わらない', () => {
      const nodes: NodeWithChildIds[] = [
        node('R', 0, ['A', 'B']),
        node('A', 1, ['C']),
        node('B', 1),
        node('C', 2),
      ];

      const beforeIds: string[] = nodes.map((n) => n.id);
      service.calcHeights(nodes);

      expect(nodes.map((n) => n.id)).toEqual(beforeIds);
    });

    it('子ノード最大数を持つノードがあるプラントの場合、親ノードも返り値に含まれる', () => {
      const nodes: NodeWithChildIds[] = [
        node('R', 0, ['A', 'B']),
        node('A', 1, ['C', 'D', 'E', 'F']),
        node('B', 1),
        node('C', 2),
        node('D', 2),
        node('E', 2),
        node('F', 2),
      ];

      const heights: Map<string, number> = service.calcHeights(nodes);

      expect(heights.get('A')).toBe(1);
      expect(heights.size).toBe(nodes.length);
    });

    it('子ノードが見つからない場合、例外エラーを返す', () => {
      const nodes: NodeWithChildIds[] = [
        node('R', 0, ['A', 'B']),
        node('A', 1, ['C', 'D', 'E']),
        node('B', 1),
        node('C', 2),
        node('D', 2),
        // 存在するはずの「E」が存在しない
      ];

      expect(() => service.calcHeights(nodes)).toThrow(
        '子ノードの高さが未計算です: E',
      );
    });

    it('親から参照されていないノードが含まれても、高さ0として計算される', () => {
      // parentId の欠損などで孤立したノードを想定。
      // 検知は calcHeights の責務ではなく、grow() 側でルートが1つであることを検証する
      const nodes: NodeWithChildIds[] = [
        node('R', 0, ['A', 'B']),
        node('A', 1, ['C', 'D', 'E']),
        node('B', 1),
        node('C', 2),
        node('D', 2),
        node('E', 2),
        node('F', 2), // 孤立ノード
      ];

      const heights: Map<string, number> = service.calcHeights(nodes);

      expect(heights.get('F')).toBe(0);
      expect(heights.size).toBe(nodes.length);
    });
  });

  describe('createPlantEdges', () => {
    // -------------------
    //  引数生成ヘルパー関数
    // -------------------
    const PLANT_ID = 'plant-1';

    const edge = (
      fromId: string,
      toId: string,
      edgeType: EdgeType = EdgeType.SKELETON,
    ): CreatedEdge => ({ plantId: PLANT_ID, fromId, toId, edgeType });

    // DB既存エッジを返すトランザクションのモック
    const createTx = (curEdges: { fromId: string; toId: string }[] = []) => {
      const plantEdge = {
        findMany: jest.fn().mockResolvedValue(curEdges),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      };
      const tx = { plantEdge } as unknown as Prisma.TransactionClient;
      return { tx, plantEdge };
    };

    it('主エッジを渡した場合、親→新ノードの向きのまま保存される', async () => {
      const { tx, plantEdge } = createTx();

      await service.createPlantEdges(tx, PLANT_ID, [edge('P', 'N')]);

      expect(plantEdge.createMany).toHaveBeenCalledWith({
        data: [edge('P', 'N')],
        skipDuplicates: true,
      });
    });

    it('DBに既にある辺と逆向きの辺を渡した場合、保存されない', async () => {
      const { tx, plantEdge } = createTx([{ fromId: 'A', toId: 'B' }]);

      await service.createPlantEdges(tx, PLANT_ID, [
        edge('B', 'A', EdgeType.SPREAD),
      ]);

      expect(plantEdge.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });
    });

    it('同一バッチ内に逆向きの辺がある場合、先に渡した方だけ保存される', async () => {
      const { tx, plantEdge } = createTx();

      await service.createPlantEdges(tx, PLANT_ID, [
        edge('A', 'B', EdgeType.SPREAD),
        edge('B', 'A', EdgeType.SPREAD),
      ]);

      expect(plantEdge.createMany).toHaveBeenCalledWith({
        data: [edge('A', 'B', EdgeType.SPREAD)],
        skipDuplicates: true,
      });
    });

    it('既存エッジの検索が、対象Plantと今回触れるノードに絞られる', async () => {
      const { tx, plantEdge } = createTx();

      await service.createPlantEdges(tx, PLANT_ID, [
        edge('N', 'X', EdgeType.SPREAD),
        edge('N', 'Y', EdgeType.SPREAD),
      ]);

      expect(plantEdge.findMany).toHaveBeenCalledWith({
        where: {
          plantId: PLANT_ID,
          OR: [
            { fromId: { in: ['N', 'X', 'Y'] } },
            { toId: { in: ['N', 'X', 'Y'] } },
          ],
        },
        select: { fromId: true, toId: true },
      });
    });

    it('エッジが空の場合、DBにアクセスしない', async () => {
      const { tx, plantEdge } = createTx();

      await service.createPlantEdges(tx, PLANT_ID, []);

      expect(plantEdge.findMany).not.toHaveBeenCalled();
      expect(plantEdge.createMany).not.toHaveBeenCalled();
    });
  });
});
