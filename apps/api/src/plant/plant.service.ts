import { Injectable } from '@nestjs/common';
import { EdgeType, GrowthStage, Plant, Prisma } from 'generated/prisma/client';
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
  P_LEAF,
} from './plant.constants';

@Injectable()
export class PlantService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 指定された範囲内のランダムな小数を生成する
   *
   * @param {number} min - 最小値(含む)
   * @param {number} max - 最大値(含まない)
   * @returns {number} min以上max未満のランダムな小数
   * @throws {Error} minがmaxより大きい場合
   */
  private random(min: number, max: number): number {
    if (min > max) {
      throw new Error('最小値は最大値未満である必要があります');
    }
    return Math.random() * (max - min) + min;
  }

  /**
   * 指定された確率に基づいて、ランダムに真偽値（true / false）を返す
   *
   * @param {number} prob 判定がtrueになる確率（0.0 以上 1.0 以下の数値）
   * @returns {boolean} 確率を満たした場合はtrue、そうでない場合はfalse
   *
   * @example
   * // 30% の確率で true を返す
   * const isSuccess = this.withChance(0.3);
   */
  private withChance(prob: number): boolean {
    return Math.random() < prob;
  }

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
  ): Promise<void> {
    if (edges.length === 0) return;

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

    await tx.plantEdge.createMany({
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
      const newNode: PlantNodeResponse = await this.generateNode(
        tx,
        plantId,
        todoId,
        parent,
      );

      newNodes.push(newNode);
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

    if (this.withChance(P_LEAF)) {
      /* 葉ノード高さ優先ルート */
      // 葉に近いほど大きい重み。nodesの順に生成
      const maxHeight = Math.max(...heights.values());
      const weights = candidates.map(
        (n) => maxHeight - (heights.get(n.id) ?? 0) + 1,
      );
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      // 重みを順に引いて、最初に負になったノードが当選
      let r = this.random(0, totalWeight);
      for (let j = 0; j < weights.length; j++) {
        r -= weights[j];
        if (r < 0) return candidates[j];
      }

      // 境界値のフォールバック
      return candidates[candidates.length - 1];
    }

    /* 完全ランダムルート */
    const rr = Math.floor(this.random(0, candidates.length));
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
  ): Promise<PlantNodeResponse> {
    // 色彩
    const hue = Math.max(
      MIN_HUE,
      BASE_HUE - parent.depth * HUE_DECAY_PER_DEPTH,
    );
    // 大きさ
    const size = Math.max(
      MIN_SIZE,
      parent.size * this.random(MIN_SIZE_RATIO, MAX_SIZE_RATIO),
    );
    const angle = this.random(0, Math.PI * 2);
    const dist = this.random(size + 10, size + 20);

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
    await this.createPlantEdges(tx, plantId, [edge]);

    return newNode;
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
