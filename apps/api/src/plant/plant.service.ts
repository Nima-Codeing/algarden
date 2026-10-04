import { Injectable } from '@nestjs/common';
import {
  EdgeType,
  GrowthStage,
  Plant,
  PlantEdge,
  Prisma,
} from 'generated/prisma/client';
import {
  CreatedEdge,
  CreatedNode,
  GrowthStageResult,
  NodeWithChildIds,
  NodeWithChildrens,
  PlantNodeResponse,
  plantNodeSelect,
} from './types/plant.types';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BASE_HUE,
  HUE_DECAY_PER_DEPTH,
  MAX_CHILDREN,
  MAX_SIZE_RATIO,
  MIN_HUE,
  MIN_SIZE,
  MIN_SIZE_RATIO,
  P_BURN_MAIN,
  P_BURN_SUB,
  P_FIRE,
  P_LEAF,
  ROOT_SIZE,
} from './plant.constants';
import { RandomService } from 'src/common/random/random.service';
import { DateService } from 'src/common/date/date.service';

@Injectable()
export class PlantService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly randomService: RandomService,
    private readonly dateService: DateService,
  ) {}

  /**
   * 指定Garden内の全Plantを取得する
   *
   * @param {string} gardenId - 対象Gardenのid
   * @returns {Plant[]} Plant配列
   */
  async getAllPlants(gardenId: string): Promise<Plant[]> {
    return await this.prismaService.plant.findMany({
      where: { gardenId },
    });
  }

  /**
   * 指定idのPlantを取得する
   *
   * @param {string} id - 取得するPlantのid
   * @returns {Plant} 取得したPlant
   * @throws {Error} 該当Plantが存在しない場合
   */
  async getPlant(id: string): Promise<Plant> {
    return await this.prismaService.plant.findUniqueOrThrow({
      where: { id },
    });
  }

  /**
   * 指定Plantの全ノードを子ノード付きで取得する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 対象Plantのid
   * @returns {NodeWithChildrens[]} 子ノードを含む全ノード配列
   */
  async getPlantNodes(
    tx: Prisma.TransactionClient,
    plantId: string,
  ): Promise<NodeWithChildrens[]> {
    return await tx.plantNode.findMany({
      where: { plantId },
      include: { children: true },
    });
  }

  /**
   * ノードを1件保存する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {CreatedNode} nodeEmt - 保存するノードのパラメータ
   * @returns {PlantNodeResponse} 保存されたノード
   */
  async createPlantNode(
    tx: Prisma.TransactionClient,
    nodeEmt: CreatedNode,
  ): Promise<PlantNodeResponse> {
    return await tx.plantNode.create({
      data: nodeEmt,
      select: plantNodeSelect,
    });
  }

  /**
   * 指定Plantの全エッジを取得する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 対象Plantのid
   * @returns {PlantEdge[]} 主エッジ・副エッジを含む全エッジ配列
   */
  async getPlantEdges(
    tx: Prisma.TransactionClient,
    plantId: string,
  ): Promise<PlantEdge[]> {
    return await tx.plantEdge.findMany({
      where: { plantId },
    });
  }

  /**
   * Plantのノード数と成長段階を更新する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} id - 対象Plantのid
   * @param {number} cnt - 加算するノード数
   * @param {GrowthStage} stage - 更新後の成長段階
   */
  async updatePlantGrowth(
    tx: Prisma.TransactionClient,
    id: string,
    cnt: number,
    stage: GrowthStage,
  ) {
    await tx.plant.update({
      where: { id },
      data: {
        nodeCount: { increment: cnt },
        growthStage: stage,
      },
    });
  }

  /**
   * エッジを一括保存する
   *
   * fromId → toId はアニメーションの進行方向を表す。
   * 主エッジは 親 → 新ノード、延焼エッジは 新ノード → 燃えた既存ノード。
   * 向きは保持したまま、重複判定だけをid昇順のキーに畳んで無向として扱う
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 対象Plantのid
   * @param {CreatedEdge[]} edges - 保存するエッジ配列
   */
  async createPlantEdges(
    tx: Prisma.TransactionClient,
    plantId: string,
    edges: CreatedEdge[],
  ): Promise<PlantEdge[]> {
    if (edges.length === 0) return [];

    // 今回触れるノードに関わるエッジだけを引く
    const nodeIds = [...new Set(edges.flatMap((e) => [e.fromId, e.toId]))];
    const curEdges = await tx.plantEdge.findMany({
      where: {
        plantId,
        OR: [{ fromId: { in: nodeIds } }, { toId: { in: nodeIds } }],
      },
      select: { fromId: true, toId: true },
    });

    // 無向の重複判定キー
    // (A,B) と (B,A) が同じ文字列になる
    const toKey = (a: string, b: string): string =>
      a < b ? `${a}:${b}` : `${b}:${a}`;

    const seen = new Set(curEdges.map((e) => toKey(e.fromId, e.toId)));

    const saveEdges = edges.filter((e) => {
      const key = toKey(e.fromId, e.toId);
      if (seen.has(key)) return false;
      seen.add(key); // バッチ内の重複対策
      return true;
    });

    return await tx.plantEdge.createManyAndReturn({
      data: saveEdges,
      skipDuplicates: true,
    });
  }

  /**
   * 追加ノード数をもとにPlantの現在の成長段階と昇格有無を算出する
   *
   * @param {string} plantId - 対象Plantのid
   * @param {number} addNodeCnt - 追加するノード数
   * @returns {GrowthStageResult} 現在の成長段階と昇格フラグ
   */
  async calcGrowthStage(
    plantId: string,
    addNodeCnt: number,
  ): Promise<GrowthStageResult> {
    const plant = await this.getPlant(plantId);
    const curNodeCnt = plant.nodeCount + addNodeCnt;

    const curStage: GrowthStage =
      curNodeCnt <= 5
        ? GrowthStage.SPROUT
        : curNodeCnt <= 15
          ? GrowthStage.YOUNG
          : curNodeCnt <= 30
            ? GrowthStage.MATURE
            : GrowthStage.BLOOM;

    const isPromotion: boolean = plant.growthStage !== curStage;

    return {
      curStage,
      isPromotion,
    } satisfies GrowthStageResult;
  }

  /**
   * Plantを生成し、Seedを植えてRootNodeを生成
   *
   * @param {Prisma.TransactionClient} tx
   * @param {string} gardenId - 植える庭のID
   * @param {string} seedId - 植える種のID
   * @param {number} x - 植える種の初期 x座標
   * @param {number} y - 植える種の初期 y座標
   */
  async plantRoot(
    tx: Prisma.TransactionClient,
    gardenId: string,
    seedId: string,
    x: number = 0,
    y: number = 0,
  ) {
    await tx.seed.update({
      where: { id: seedId },
      data: { x, y, isPlanted: true, plantedAt: this.dateService.now() },
    });

    await tx.plant.create({
      data: {
        gardenId,
        seedId,
        plantNodes: {
          create: {
            // NOTE: 座標 plantはseedの相対座標のため固定値
            x: 0,
            y: 0,
            hue: BASE_HUE,
            size: ROOT_SIZE,
            depth: 0,
          },
        },
      },
    });
  }

  /**
   * 指定Plantに指定個数のノードを1つずつ生やす
   *
   * 1個生やすごとにノードを取り直し、更新後の木の形をもとに次の着火点を選ぶ
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 成長させるPlantのid
   * @param {string} todoId - 成長もとのTodoのid
   * @param {number} count - 生成するノード数
   * @param {GrowthStageResult} growthStat - 更新後の成長段階
   * @returns {PlantNodeResponse[]} 生成・保存されたノード配列
   */
  async grow(
    tx: Prisma.TransactionClient,
    plantId: string,
    todoId: string,
    count: number,
    growthStat: GrowthStageResult,
  ): Promise<PlantNodeResponse[]> {
    const newNodes: PlantNodeResponse[] = [];

    for (let i = 0; i < count; i++) {
      // 親ノード決定
      const nodes: NodeWithChildrens[] = await this.getPlantNodes(tx, plantId);
      if (nodes.filter((n) => n.parentId === null).length !== 1) {
        throw new Error('Nodes情報が壊れています。');
      }
      const parent: NodeWithChildrens = this.determineGrowthPoint(nodes);

      // ノード生成
      const [newNode, mainEdge] = await this.generateNode(
        tx,
        plantId,
        todoId,
        parent,
      );

      newNodes.push(newNode);

      // 延焼時、副エッジ生成
      if (this.randomService.withChance(P_FIRE)) {
        await this.forestFire(tx, plantId, newNode.id, mainEdge.id, parent.id);
      }
    }
    await this.updatePlantGrowth(tx, plantId, count, growthStat.curStage);

    return newNodes;
  }

  /**
   * 新しいノードを生やす親ノード（着火点）を二系統抽選で決定する
   *
   * 子ノード数がMAX_CHILDREN未満のノードを候補とし、P_LEAFの確率で
   * 葉に近いノードほど当たりやすい重み付き抽選を行う。外れた場合は
   * 候補からの完全ランダム抽選になる
   *
   * @param {NodeWithChildrens[]} nodes - 成長対象のPlant内全ノード群
   * @returns {NodeWithChildrens} 着火点に選ばれたノード
   * @throws {Error} 候補ノードが1つも存在しない場合
   */
  determineGrowthPoint(nodes: NodeWithChildrens[]): NodeWithChildrens {
    // 葉からの高さ計算
    // NOTE: 参照で計算していて、子を除外すると親が計算できなくなるため全ノードで計算
    const heights = this.calcHeights(nodes);

    // 抽出対象は子ノード数が４未満のノードのみ
    const candidates = nodes.filter((n) => n.children.length < MAX_CHILDREN);
    if (candidates.length === 0) {
      throw new Error('成長可能なノードがありません。');
    }

    if (this.randomService.withChance(P_LEAF)) {
      /* 葉ノード高さ優先ルート */
      // 葉に近いほど大きい重み。nodesの順に生成
      const maxHeight = Math.max(...heights.values());
      const weights = candidates.map(
        (n) => maxHeight - (heights.get(n.id) ?? 0) + 1,
      );
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      // 重みを順に引いて、最初に負になったノードが当選
      let r = this.randomService.between(0, totalWeight);
      for (let j = 0; j < weights.length; j++) {
        r -= weights[j];
        if (r < 0) return candidates[j];
      }

      // 境界値のフォールバック
      return candidates[candidates.length - 1];
    }

    /* 完全ランダムルート */
    const rr = Math.floor(this.randomService.between(0, candidates.length));
    return candidates[rr];
  }

  /**
   * 指定された親ノードから子ノードを1つ生成して保存する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 生成先Plantのid
   * @param {string} todoId - ノードの生成元となるTodoのid
   * @param {NodeWithChildrens} parent - 生成ノードの親
   * @returns {PlantNodeResponse} 生成・保存されたノード
   */
  async generateNode(
    tx: Prisma.TransactionClient,
    plantId: string,
    todoId: string,
    parent: NodeWithChildrens,
  ): Promise<[newNode: PlantNodeResponse, mainEdge: PlantEdge]> {
    // 色彩
    const hue = Math.max(
      MIN_HUE,
      BASE_HUE - parent.depth * HUE_DECAY_PER_DEPTH,
    );
    // 大きさ
    const size = Math.max(
      MIN_SIZE,
      parent.size * this.randomService.between(MIN_SIZE_RATIO, MAX_SIZE_RATIO),
    );
    const angle = this.randomService.between(0, Math.PI * 2);
    const dist = this.randomService.between(size + 10, size + 20);

    // 子ノードのパラメータは親から継承し、深さに応じて減衰させる
    const node = {
      x: parent.x + dist * Math.cos(angle),
      y: parent.y + dist * Math.sin(angle),
      hue: hue,
      size: size,
      depth: parent.depth + 1,
      parentId: parent.id,
      plantId: plantId,
      todoId,
    } satisfies CreatedNode;

    // ノード生成
    const newNode = await this.createPlantNode(tx, node);

    // 主エッジ作成
    const edge: CreatedEdge = {
      plantId: plantId,
      fromId: parent.id,
      toId: newNode.id,
      edgeType: EdgeType.SKELETON,
    };
    const mainEdge = (await this.createPlantEdges(tx, plantId, [edge]))[0];
    if (!mainEdge) throw new Error('主エッジが見つかりませんでした。');
    return [newNode, mainEdge];
  }

  /**
   * 着火点から延焼させ、燃えた既存ノードと新ノードを副エッジで繋いで保存する
   *
   * 着火点 - 新ノード間の主エッジは延焼判定の対象から除外する。
   * 1つも燃えなかった場合は何も保存しない
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} plantId - 対象Plantのid
   * @param {string} newNodeId - 今回生成した新ノードのid
   * @param {string} mainEdgeId - 着火点 - 新ノード間の主エッジのid
   * @param {string} flashPointId - 着火点（新ノードの親）のid
   */
  async forestFire(
    tx: Prisma.TransactionClient,
    plantId: string,
    newNodeId: string,
    mainEdgeId: string,
    flashPointId: string,
  ) {
    // 全エッジ取得
    const tempEdges = await this.getPlantEdges(tx, plantId);
    // 着火点 - 新ノード間エッジ除外
    const edges = tempEdges.filter((e) => e.id !== mainEdgeId);

    const flashPoint: Map<string, boolean> = new Map([[flashPointId, false]]);

    // 幅優先探索(BFS)的 延焼処理
    const createSubEdges: CreatedEdge[] = this.burnAdjacent(
      0,
      plantId,
      newNodeId,
      edges,
      flashPoint,
      [],
    );
    if (createSubEdges.length !== 0) {
      await this.createPlantEdges(tx, plantId, createSubEdges);
    }
  }

  /**
   * 受け取ったノードの隣接ノードに延焼判定を行う
   * 再帰的に呼び出し、幅優先探索(BFS)のように延焼判定を行う
   *
   * 延焼確率は深さごとに P_BURN_MAIN / P_BURN_SUB から選ぶ。
   * 一度副エッジを経由した延焼は、以降の深さでも P_BURN_SUB を使う。
   * 延焼判定済みのノードは二度判定しない
   *
   * @param {number} depth - 現在の深さ（着火点の隣接ノードが0）
   * @param {string} plantId - 対象Plantのid
   * @param {string} newNodeId - 副エッジの始点となる新ノードのid
   * @param {PlantEdge[]} edges - 隣接探索に使うエッジ配列（主エッジ除外済み）
   * @param {Map<string, boolean>} flashPointIds - 本層の着火点 <ノードid, 副エッジ経由済みflag>
   * @param {string[]} preBurnedIds - 前層までに延焼判定済みのノードid
   * @returns {CreatedEdge[]} 本層以降で燃えたノードへの副エッジ配列
   */
  burnAdjacent(
    depth: number,
    plantId: string,
    newNodeId: string,
    edges: PlantEdge[],
    flashPointIds: Map<string, boolean>,
    preBurnedIds: string[],
  ): CreatedEdge[] {
    // 本層で生成したreturn用の副エッジ
    const createSubEdges: CreatedEdge[] = [];
    // 延焼判定済みのノードID
    const burnedIds: string[] = [...preBurnedIds];
    // 次層の着火点ノードID <着火点ノードID, 副エッジ経由済みflag>
    const nextFlashPointIds = new Map<string, boolean>();

    for (const [flashPointId, isFlashViaSub] of flashPointIds) {
      // 隣接ノードID, エッジ型 取得
      const adjInfo = edges.flatMap((e) => {
        if (e.fromId === flashPointId)
          return [{ adjacentId: e.toId, edgeType: e.edgeType }];
        if (e.toId === flashPointId)
          return [{ adjacentId: e.fromId, edgeType: e.edgeType }];
        return [];
      });

      for (const { adjacentId, edgeType } of adjInfo) {
        const isBurned = Boolean(
          burnedIds.find((burnedId) => burnedId === adjacentId),
        );
        if (isBurned) continue; // 一度延焼判定をしているノードの場合

        // 主・副エッジの延焼確率設定
        const isViaSub = isFlashViaSub || edgeType !== EdgeType.SKELETON;
        const burnP = isViaSub ? P_BURN_SUB : P_BURN_MAIN;

        if (this.randomService.withChance(burnP[depth] ?? 0)) {
          // 延焼成功

          // 副エッジ生成
          createSubEdges.push({
            plantId,
            fromId: newNodeId,
            toId: adjacentId,
            edgeType: EdgeType.SPREAD,
          } satisfies CreatedEdge);

          // 延焼が続くため、次の深さの着火点として格納
          nextFlashPointIds.set(adjacentId, isViaSub);
        }

        // NOTE: 燃えなかったノードを延焼判定済みとして記憶する。
        // NOTE: 同深さで二度延焼判定をしないようにする。
        burnedIds.push(adjacentId);
      }

      burnedIds.push(flashPointId);
    }

    // 現在延焼したノードのさらに隣接ノードの延焼判定
    if (nextFlashPointIds.size !== 0) {
      const res = this.burnAdjacent(
        depth + 1,
        plantId,
        newNodeId,
        edges,
        nextFlashPointIds,
        burnedIds,
      );
      createSubEdges.push(...res);
    }

    return createSubEdges;
  }

  /**
   * 渡されたノード配列内の全ノードの葉からの高さを計算する
   *
   * @param {NodeWithChildIds[]} nodes - 成長対象のPlant内全ノード群
   * @returns {Map<string, number>} - key:ノードID value:葉からの高さ
   */
  calcHeights(nodes: NodeWithChildIds[]): Map<string, number> {
    // depth降順
    const sorted = [...nodes].sort((a, b) => b.depth - a.depth);

    const nodeIdToHeight = new Map<string, number>(); // 高さ格納用

    for (const p of sorted) {
      let maxHeight = 0;

      for (const c of p.children) {
        /* [子ノード内の最大高さ + 1]として高さを設定 */
        const childHeight = nodeIdToHeight.get(c.id);
        if (childHeight === undefined) {
          // DBの親子関係が崩壊している場合
          throw new Error(`子ノードの高さが未計算です: ${c.id}`);
        }

        maxHeight = Math.max(maxHeight, childHeight + 1);
      }

      nodeIdToHeight.set(p.id, maxHeight);
    }

    return nodeIdToHeight;
  }
}
