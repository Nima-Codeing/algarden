import { Test, TestingModule } from '@nestjs/testing';
import { PlantService } from './plant.service';
import { CreatedEdge, NodeWithChildIds } from './types/plant.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { EdgeType, PlantEdge, Prisma } from 'generated/prisma/client';
import { RandomService } from 'src/common/random/random.service';
import {
  BASE_HUE,
  P_BURN_MAIN,
  P_BURN_SUB,
  ROOT_SIZE,
} from './plant.constants';
import { DateService } from 'src/common/date/date.service';

describe('PlantService', () => {
  let service: PlantService;
  let randomService: RandomService;

  const DATE_NOW = new Date('2026-11-01T00:00:00Z');

  const prismaMock = {
    seed: {
      update: jest.fn(),
    },
    plant: {
      create: jest.fn(),
    },
  };
  const randomMock = {
    withChance: jest.fn(),
  };
  const dateMock = {
    now: jest.fn().mockImplementation(() => DATE_NOW),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RandomService, useValue: randomMock },
        { provide: DateService, useValue: dateMock },
      ],
    }).compile();

    service = module.get<PlantService>(PlantService);
    randomService = module.get<RandomService>(RandomService);
  });

  describe('plantRoot', () => {
    it('指定座標に種を植え、ルートノードは原点（相対座標）に作る', async () => {
      await service.plantRoot(
        prismaMock as unknown as Prisma.TransactionClient,
        'g1',
        's1',
        100,
        50,
      );

      expect(prismaMock.seed.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { x: 100, y: 50, isPlanted: true, plantedAt: DATE_NOW },
      });
      expect(prismaMock.plant.create).toHaveBeenCalledWith({
        data: {
          gardenId: 'g1',
          seedId: 's1',
          plantNodes: {
            create: {
              x: 0,
              y: 0,
              hue: BASE_HUE,
              size: ROOT_SIZE,
              depth: 0,
            },
          },
        },
      });
    });
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
        createManyAndReturn: jest.fn().mockResolvedValue([]),
      };
      const tx = { plantEdge } as unknown as Prisma.TransactionClient;
      return { tx, plantEdge };
    };

    it('主エッジを渡した場合、親→新ノードの向きのまま保存される', async () => {
      const { tx, plantEdge } = createTx();

      await service.createPlantEdges(tx, PLANT_ID, [edge('P', 'N')]);

      expect(plantEdge.createManyAndReturn).toHaveBeenCalledWith({
        data: [edge('P', 'N')],
        skipDuplicates: true,
      });
    });

    it('DBに既にある辺と逆向きの辺を渡した場合、保存されない', async () => {
      const { tx, plantEdge } = createTx([{ fromId: 'A', toId: 'B' }]);

      await service.createPlantEdges(tx, PLANT_ID, [
        edge('B', 'A', EdgeType.SPREAD),
      ]);

      expect(plantEdge.createManyAndReturn).toHaveBeenCalledWith({
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

      expect(plantEdge.createManyAndReturn).toHaveBeenCalledWith({
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
      expect(plantEdge.createManyAndReturn).not.toHaveBeenCalled();
    });
  });

  describe('forestFire', () => {
    // -------------------
    //  引数生成ヘルパー関数
    // -------------------
    const PLANT_ID = 'plant-1';
    const NEW_NODE_ID = 'N';
    const FLASH_POINT_ID = 'P';
    const MAIN_EDGE_ID = `${FLASH_POINT_ID}-${NEW_NODE_ID}`;

    const plantEdge = (
      fromId: string,
      toId: string,
      edgeType: EdgeType = EdgeType.SKELETON,
    ): PlantEdge => ({
      id: `${fromId}-${toId}`,
      plantId: PLANT_ID,
      fromId,
      toId,
      edgeType,
      createdAt: new Date(0),
    });

    // 1回目のfindManyは隣接探索用の全エッジ、2回目以降は重複判定用の既存エッジ
    const createTx = (curEdges: PlantEdge[]) => {
      const plantEdge = {
        findMany: jest
          .fn()
          .mockResolvedValueOnce(curEdges)
          .mockResolvedValue([]),
        createManyAndReturn: jest.fn().mockResolvedValue([]),
      };
      const tx = { plantEdge } as unknown as Prisma.TransactionClient;
      return { tx, plantEdge };
    };

    // 延焼判定の結果を固定する
    const mockBurn = (result: boolean) => {
      jest.spyOn(randomService, 'withChance').mockReturnValue(result);
    };

    it('主エッジを隣接探索から除外し、新ノード自身への副エッジを作らない', async () => {
      mockBurn(true);
      const { tx, plantEdge: mock } = createTx([
        plantEdge(FLASH_POINT_ID, NEW_NODE_ID), // 主エッジ
        plantEdge(FLASH_POINT_ID, 'A'),
      ]);

      await service.forestFire(
        tx,
        PLANT_ID,
        NEW_NODE_ID,
        MAIN_EDGE_ID,
        FLASH_POINT_ID,
      );

      expect(mock.createManyAndReturn).toHaveBeenCalledWith({
        data: [
          {
            plantId: PLANT_ID,
            fromId: NEW_NODE_ID,
            toId: 'A',
            edgeType: EdgeType.SPREAD,
          },
        ],
        skipDuplicates: true,
      });
    });

    it('1つも燃えなかった場合、保存しない', async () => {
      mockBurn(false);
      const { tx, plantEdge: mock } = createTx([
        plantEdge(FLASH_POINT_ID, NEW_NODE_ID), // 主エッジ
        plantEdge(FLASH_POINT_ID, 'A'),
      ]);

      await service.forestFire(
        tx,
        PLANT_ID,
        NEW_NODE_ID,
        MAIN_EDGE_ID,
        FLASH_POINT_ID,
      );

      expect(mock.createManyAndReturn).not.toHaveBeenCalled();
    });
  });

  describe('burnAdjacent', () => {
    // -------------------
    //  引数生成ヘルパー関数
    // -------------------
    const PLANT_ID = 'plant-1';
    const NEW_NODE_ID = 'N';

    // 隣接探索に使う既存エッジ
    const plantEdge = (
      fromId: string,
      toId: string,
      edgeType: EdgeType = EdgeType.SKELETON,
    ): PlantEdge => ({
      id: `${fromId}-${toId}`,
      plantId: PLANT_ID,
      fromId,
      toId,
      edgeType,
      createdAt: new Date(0),
    });

    // 着火点1つから延焼を始める
    const burnFrom = (
      flashPointId: string,
      edges: PlantEdge[],
    ): CreatedEdge[] =>
      service.burnAdjacent(
        0,
        PLANT_ID,
        NEW_NODE_ID,
        edges,
        new Map([[flashPointId, false]]),
        [],
      );

    // 延焼判定操作
    const spyBurn = (result: boolean | ((p: number) => boolean)) => {
      const probs: number[] = []; // 確率記録用

      jest.spyOn(randomService, 'withChance').mockImplementation((p) => {
        probs.push(p);
        return typeof result === 'function' ? result(p) : result;
      });

      return probs;
    };

    it('隣が燃えた場合、新ノード → 隣の副エッジを返す', () => {
      spyBurn(true);
      const edges: PlantEdge[] = [plantEdge('P', 'A')];

      const subEdges: CreatedEdge[] = burnFrom('P', edges);

      expect(subEdges).toEqual([
        {
          plantId: PLANT_ID,
          fromId: NEW_NODE_ID,
          toId: 'A',
          edgeType: EdgeType.SPREAD,
        },
      ]);
    });

    it('ループがあっても、着火点は副エッジの toId に含まれない', () => {
      spyBurn(true);
      const edges: PlantEdge[] = [
        plantEdge('P', 'A'),
        plantEdge('P', 'B'),
        plantEdge('B', 'C'),
        plantEdge('C', 'P'),
      ];

      const subEdges: CreatedEdge[] = burnFrom('P', edges);

      expect(subEdges).not.toContainEqual({
        plantId: PLANT_ID,
        fromId: NEW_NODE_ID,
        toId: 'P',
        edgeType: EdgeType.SPREAD,
      });
    });

    it('同じ深さの2ノードと隣り合うノードは、1回だけ判定される', () => {
      const probs: number[] = spyBurn(true);
      const edges: PlantEdge[] = [
        plantEdge('P', 'A'),
        plantEdge('P', 'B'),
        plantEdge('A', 'C'),
        plantEdge('C', 'B', EdgeType.SPREAD),
      ];

      const subEdges: CreatedEdge[] = burnFrom('P', edges);
      // 生成エッジの重複確認
      const subKeys = subEdges.map((e) => `${e.fromId}-${e.toId}`);
      const uniqeKeys = new Set(subKeys);

      expect(subKeys.length).toBe(uniqeKeys.size);
      expect(probs.length).toBe(3);
    });

    it('燃えなかったノードの先には延焼しない', () => {
      spyBurn(false);
      const edges: PlantEdge[] = [
        plantEdge('P', 'A'),
        plantEdge('A', 'B'),
        plantEdge('B', 'C'),
      ];

      const subEdges: CreatedEdge[] = burnFrom('P', edges);

      expect(subEdges.length).toBe(0);
    });

    it('主エッジ経由では P_BURN_MAIN の確率で判定する', () => {
      const probs: number[] = spyBurn(true);
      const edges: PlantEdge[] = [plantEdge('P', 'A')];

      burnFrom('P', edges);

      expect(probs).toEqual([P_BURN_MAIN[0]]);
    });

    it('副エッジ経由では P_BURN_SUB の確率で判定する', () => {
      const probs: number[] = spyBurn(true);
      const edges: PlantEdge[] = [plantEdge('P', 'A', EdgeType.SPREAD)];

      burnFrom('P', edges);

      expect(probs).toEqual([P_BURN_SUB[0]]);
    });

    it('一度副エッジを通ったら、以降は主エッジ経由でも P_BURN_SUB を使う', () => {
      const probs: number[] = spyBurn(true);
      const edges: PlantEdge[] = [
        plantEdge('P', 'A', EdgeType.SPREAD),
        plantEdge('A', 'B'),
      ];

      burnFrom('P', edges);

      expect(probs).toEqual([P_BURN_SUB[0], P_BURN_SUB[1]]);
    });

    it('深さに応じた確率で判定し、配列の末尾で延焼が止まる', () => {
      const probs: number[] = spyBurn((p) => p > 0);
      const edges: PlantEdge[] = [
        plantEdge('P', 'A'),
        plantEdge('A', 'B'),
        plantEdge('B', 'C'),
        plantEdge('C', 'D'),
        plantEdge('D', 'E'),
        plantEdge('E', 'F'), // 延焼しない
        plantEdge('F', 'G'), // 延焼しない
      ];

      const subEdges: CreatedEdge[] = burnFrom('P', edges);

      expect(probs).toEqual(P_BURN_MAIN);
      expect(subEdges.length).toEqual(5);
    });

    it('着火点に隣がない場合、空配列を返し、判定しない', () => {
      const probs: number[] = spyBurn(true);

      const subEdges: CreatedEdge[] = burnFrom('P', []);

      expect(probs).toEqual([]);
      expect(subEdges).toEqual([]);
    });
  });
});
