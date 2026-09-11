import { BadRequestException, Injectable } from '@nestjs/common';
import { GrowthStage, Plant, PlantNode } from 'generated/prisma/client';
import {
  CreatedNode,
  GrowthStageResult,
  NodeWithChildIds,
  NodeWithChildrens,
  PlantWithNodes,
} from './types/plant.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 指定された範囲内のランダムな小数を生成する
   *
   * @param {number} min - 最小値(含む)
   * @param {number} max - 最大値(含む)
   * @returns {number} min以上max以下のランダムな小数
   * @throws {Error} minがmaxより大きい場合
   */
  private random(min: number, max: number): number {
    if (min > max) {
      throw new Error('最小値は最大値以下である必要があります');
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

  private async getPlantNodes(plantId: string): Promise<NodeWithChildrens[]> {
    return await this.prismaService.plantNode.findMany({
      where: { plantId },
      include: { children: true },
    });
  }

  /**
   * 指定Plantに指定個数のノードを1つずつ生やす
   *
   * 1個生やすごとにノードを取り直し、更新後の木の形をもとに次の着火点を選ぶ
   *
   * @param {string} plantId - 成長させるPlantのid
   * @param {number} count - 生成するノード数
   */
  async grow(plantId: string, count: number) {
    for (let i = 0; i < count; i++) {
      const nodes: NodeWithChildrens[] = await this.getPlantNodes(plantId);
      this.determineGrowthPoint(nodes);
    }
  }

  /**
   * 新しいノードを生やす親ノード（着火点）を二系統抽選で決定する
   *
   * 子ノード数がMAX_CHILDREN未満のノードを候補とし、pLeafの確率で
   * 葉に近いノードほど当たりやすい重み付き抽選を行う。外れた場合は
   * 候補からの完全ランダム抽選になる
   *
   * @param {NodeWithChildrens[]} nodes - 成長対象のPlant内全ノード群
   * @returns {string} 着火点に選ばれたノードのid
   * @throws {Error} 候補ノードが1つも存在しない場合
   */
  private determineGrowthPoint(nodes: NodeWithChildrens[]): string {
    const P_LEAF = 0.8; // 葉ノード高さ優先ルートを選ぶ確率（0.0以上1.0以下）
    const MAX_CHILDREN = 4; // 子ノード数の上限

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
        if (r < 0) return candidates[j].id;
      }

      // 境界値のフォールバック
      return candidates[candidates.length - 1].id;
    }

    /* 完全ランダムルート */
    const rr = Math.floor(this.random(0, candidates.length));
    return candidates[rr].id;
  }

  /**
   * 指定された個数の子ノードをランダムな親から生成する
   *
   * @param {number} count - 生成するノード数
   * @param {PlantWithNode} selectPlant - ノードを追加するPlant
   * @param {string} todoId - ノードの生成元となるTodoのid
   * @returns {CreatedNode[]} 生成したノード配列
   */
  generateNode(
    count: number,
    selectPlant: PlantWithNodes,
    todoId: string,
  ): CreatedNode[] {
    const MIN_HUE = 80;
    const BASE_HUE = 120;
    const HUE_DECAY_PER_DEPTH = 4;
    const MIN_SIZE = 3;
    const MIN_SIZE_RATIO = 0.65;
    const MAX_SIZE_RATIO = 0.88;

    const createdNodes: CreatedNode[] = [];

    for (let i = 0; i < count; i++) {
      const nodeIndex: number = Math.floor(
        Math.random() * selectPlant.plantNodes.length,
      );
      const parentNode: PlantNode = selectPlant.plantNodes[nodeIndex];

      if (!parentNode) {
        throw new BadRequestException('親ノードが見つかりません。');
      }

      const hue = Math.max(
        MIN_HUE,
        BASE_HUE - parentNode.depth * HUE_DECAY_PER_DEPTH,
      );
      const size = Math.max(
        MIN_SIZE,
        parentNode.size * this.random(MIN_SIZE_RATIO, MAX_SIZE_RATIO),
      );
      const angle = this.random(0, Math.PI * 2);
      const dist = this.random(size + 10, size + 20);
      // 子ノードのパラメータは親から継承し、深さに応じて減衰させる
      const childNode: CreatedNode = {
        x: parentNode.x + dist * Math.cos(angle),
        y: parentNode.y + dist * Math.sin(angle),
        hue: hue,
        size: size,
        depth: parentNode.depth + 1,
        parentId: parentNode.id,
        plantId: selectPlant.id,
        todoId,
      };

      createdNodes.push(childNode);
    }

    return createdNodes;
  }

  /**
   * 追加ノード数をもとにPlantの現在の成長段階と昇格有無を算出する
   *
   * @param {Plant} selectPlant - 対象Plant
   * @param {number} addNodeCnt - 追加するノード数
   * @returns {GrowthStageResult} 現在の成長段階と昇格フラグ
   */
  calcGrowthStage(selectPlant: Plant, addNodeCnt: number): GrowthStageResult {
    const curNodeCnt = selectPlant.nodeCount + addNodeCnt;

    const curStage: GrowthStage =
      curNodeCnt <= 5
        ? GrowthStage.SPROUT
        : curNodeCnt <= 15
          ? GrowthStage.YOUNG
          : curNodeCnt <= 30
            ? GrowthStage.MATURE
            : GrowthStage.BLOOM;

    const isPromotion: boolean = selectPlant.growthStage !== curStage;

    return {
      curStage,
      isPromotion,
    };
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
