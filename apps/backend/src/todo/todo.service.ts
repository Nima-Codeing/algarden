import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GrowthStage,
  Plant,
  PlantNode,
  Todo,
  TodoScore,
} from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  CompleteTodo,
  CreatedNode,
  GrowthStageResult,
  PlantWithNode,
  Score,
} from './types/todo.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class TodoService {
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
   * Todoの作業時間と目標時間の差分率からスコアランクとノード生成数を算出する
   *
   * @param {CompleteTodo} completeTodo - 完了するTodo
   * @returns {Score} スコアランクと生成するノード数
   */
  private calcScore(completeTodo: CompleteTodo): Score {
    const { startedAt, completedAt, targetDuration } = completeTodo;

    // 目標時間が未設定の場合はスコアなしでノード1個
    if (!targetDuration) return { nodeCount: 1 };

    // 作業時間(秒)
    const timeSpent: number =
      (completedAt.getTime() - startedAt.getTime()) / 1000;

    // 目標値と実値の差分率
    const dissociationRate: number =
      Math.abs(timeSpent - targetDuration) / targetDuration;

    if (dissociationRate <= 0.05) {
      return { rank: TodoScore.S, nodeCount: 5 };
    } else if (dissociationRate <= 0.1) {
      return { rank: TodoScore.A, nodeCount: 4 };
    } else if (dissociationRate <= 0.25) {
      return { rank: TodoScore.B, nodeCount: 3 };
    } else if (dissociationRate <= 0.5) {
      return { rank: TodoScore.C, nodeCount: 2 };
    } else {
      return { rank: TodoScore.D, nodeCount: 1 };
    }
  }

  /**
   * 指定された個数の子ノードをランダムな親から生成する
   *
   * @param {number} count - 生成するノード数
   * @param {PlantWithNode} selectPlant - ノードを追加するPlant
   * @param {string} todoId - ノードの生成元となるTodoのid
   * @returns {CreatedNode[]} 生成したノード配列
   */
  private generateNode(
    count: number,
    selectPlant: PlantWithNode,
    todoId: string,
  ): CreatedNode[] {
    const createdNodes: CreatedNode[] = [];

    for (let i = 0; i < count; i++) {
      const nodeIndex: number = Math.floor(
        Math.random() * selectPlant.plantNodes.length,
      );
      const parentNode: PlantNode = selectPlant.plantNodes[nodeIndex];

      if (!parentNode) {
        throw new BadRequestException('親ノードが見つかりません。');
      }

      // 子ノードのパラメータは親から継承し、深さに応じて減衰させる
      const childNode: CreatedNode = {
        hue: Math.max(80, 120 - parentNode.depth * 4),
        size: Math.max(3, parentNode.size * this.random(0.65, 0.88)),
        length: Math.max(5, parentNode.length * this.random(0.8, 1.1)),
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
  private calcGrowthStage(
    selectPlant: Plant,
    addNodeCnt: number,
  ): GrowthStageResult {
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
  // -----------------------------------------------------------------------------

  async findByGardenId(gardenId: string): Promise<Todo[]> {
    return await this.prismaService.todo.findMany({
      where: { gardenId },
    });
  }

  async create(
    createTodoDto: CreateTodoDto,
    userId: string,
    gardenId: string,
  ): Promise<Todo> {
    return await this.prismaService.todo.create({
      data: {
        ...createTodoDto,
        userId,
        gardenId,
      },
    });
  }

  async update(updateTodoDto: UpdateTodoDto, todoId: string): Promise<Todo> {
    return await this.prismaService.todo.update({
      where: { id: todoId },
      data: { ...updateTodoDto },
    });
  }

  async delete(todoId: string): Promise<void> {
    await this.prismaService.todo.delete({
      where: { id: todoId },
    });
  }

  /**
   * Todoのタイマーを起動する
   * 同一Garden内で同時に起動できるタイマーは1つのみ
   *
   * @param {string} todoId - タイマーを起動するTodoのid
   * @param {string} gardenId - 指定Todoが属するGardenのid
   * @returns {Todo} タイマーを起動したTodo
   */
  async startTimer(todoId: string, gardenId: string): Promise<Todo> {
    // 他Todoのタイマー起動確認
    const activeTodo = await this.prismaService.todo.findFirst({
      where: {
        gardenId,
        startedAt: { not: null },
        completedAt: null,
      },
    });

    if (activeTodo) {
      throw new BadRequestException('他TODOのタイマーが作動しています。');
    }

    try {
      return await this.prismaService.todo.update({
        where: {
          id: todoId,
          startedAt: null,
        },
        data: { startedAt: new Date() },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new BadRequestException('開始済のTODOです。');
        }
      }
      throw e;
    }
  }

  /**
   * Todoを完了し、スコアに応じたノードをPlantに追加する
   *
   * @param {string} todoId - 完了させるTodoのid
   * @param {string} plantId - ノードを追加するPlantのid
   * @returns {PlantNode[]} 生成・保存されたノード配列
   */
  async complete(todoId: string, plantId: string): Promise<PlantNode[]> {
    const currentTodo = await this.prismaService.todo.findFirst({
      where: {
        id: todoId,
        startedAt: { not: null },
        completedAt: null,
      },
    });

    if (!currentTodo) {
      throw new BadRequestException('現在取り組んでいるタスクではありません。');
    }

    const completeTodo: CompleteTodo = {
      startedAt: currentTodo.startedAt!,
      completedAt: new Date(),
      targetDuration: currentTodo.targetDuration,
    };

    const score = this.calcScore(completeTodo);

    const selectPlant = await this.prismaService.plant.findUnique({
      where: { id: plantId },
      include: { plantNodes: true },
    });

    if (!selectPlant) {
      throw new NotFoundException('Plantが見つかりません。');
    }

    const createNodes = this.generateNode(
      score.nodeCount,
      selectPlant,
      currentTodo.id,
    );

    const growth = this.calcGrowthStage(selectPlant, score.nodeCount);

    if (growth.isPromotion) {
      // TODO: 成長段階昇格時の特殊演出
    }

    const [, resNodes] = await this.prismaService.$transaction([
      this.prismaService.plant.update({
        where: {
          id: selectPlant.id,
        },
        data: {
          nodeCount: { increment: score.nodeCount },
          growthStage: growth.curStage,
        },
      }),
      this.prismaService.plantNode.createManyAndReturn({
        data: createNodes,
      }),
      this.prismaService.todo.update({
        where: {
          id: currentTodo.id,
        },
        data: {
          score: score.rank,
          isCompleted: true,
          completedAt: completeTodo.completedAt,
        },
      }),
    ]);

    return resNodes;
  }
}
