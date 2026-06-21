import { BadRequestException, Injectable } from '@nestjs/common';
import { GrowthStage, Plant, PlantNode } from 'generated/prisma/client';
import {
  CreatedNode,
  GrowthStageResult,
  PlantWithNode,
} from './types/plant.types';

@Injectable()
export class PlantService {
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
   * 指定された個数の子ノードをランダムな親から生成する
   *
   * @param {number} count - 生成するノード数
   * @param {PlantWithNode} selectPlant - ノードを追加するPlant
   * @param {string} todoId - ノードの生成元となるTodoのid
   * @returns {CreatedNode[]} 生成したノード配列
   */
  generateNode(
    count: number,
    selectPlant: PlantWithNode,
    todoId: string,
  ): CreatedNode[] {
    const MIN_HUE = 80;
    const BASE_HUE = 120;
    const HUE_DECAY_PER_DEPTH = 4;
    const MIN_SIZE = 3;
    const MIN_SIZE_RATIO = 0.65;
    const MAX_SIZE_RATIO = 0.88;
    const MIN_LENGTH = 5;
    const MAX_LENGTH = 50;
    const MIN_LENGTH_RATIO = 0.8;
    const MAX_LENGTH_RATIO = 1.1;

    const createdNodes: CreatedNode[] = [];

    for (let i = 0; i < count; i++) {
      const nodeIndex: number = Math.floor(
        Math.random() * selectPlant.plantNodes.length,
      );
      const parentNode: PlantNode = selectPlant.plantNodes[nodeIndex];

      if (!parentNode) {
        throw new BadRequestException('親ノードが見つかりません。');
      }

      // ルートノードを親ノードとして生成する場合
      const parentNodeLength =
        parentNode.length === null ? MAX_LENGTH : parentNode.length;

      // 子ノードのパラメータは親から継承し、深さに応じて減衰させる
      const childNode: CreatedNode = {
        hue: Math.max(
          MIN_HUE,
          BASE_HUE - parentNode.depth * HUE_DECAY_PER_DEPTH,
        ),
        size: Math.max(
          MIN_SIZE,
          parentNode.size * this.random(MIN_SIZE_RATIO, MAX_SIZE_RATIO),
        ),
        length: Math.max(
          MIN_LENGTH,
          parentNodeLength * this.random(MIN_LENGTH_RATIO, MAX_LENGTH_RATIO),
        ),
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
}
