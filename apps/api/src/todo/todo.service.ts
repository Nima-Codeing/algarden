import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Todo, TodoScore } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  CompleteTodo,
  Score,
  TodoResponse,
  todoSelect,
} from './types/todo.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { GardenService } from 'src/garden/garden.service';
import { PlantService } from 'src/plant/plant.service';
import { PlantNodeResponse } from 'src/plant/types/plant.types';

@Injectable()
export class TodoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gardenService: GardenService,
    private readonly plantService: PlantService,
  ) {}

  /**
   * Todoの作業時間と目標時間の差分率からスコアランクとノード生成数を算出する
   *
   * @param {CompleteTodo} completeTodo - 完了するTodo
   * @returns {Score} スコアランクと生成するノード数
   */
  private calcScore(completeTodo: CompleteTodo): Score {
    const { startedAt, completedAt, targetDuration } = completeTodo;

    // 目標時間が未設定の場合はスコアなしでノード1個
    if (!targetDuration) return { rank: null, nodeCount: 1 };

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
   * ユーザーのアクティブなGardenのidを取得する
   *
   * @param {string} userId - 対象ユーザーのid
   * @returns {string} アクティブなGardenのid
   */
  private async getActiveGardenId(userId: string): Promise<string> {
    const garden = await this.gardenService.getActive(userId);
    return garden.id;
  }

  // -----------------------------------------------------------------------------

  /**
   * アクティブなGardenに属するTodo一覧を取得する
   *
   * @param {string} userId - 対象ユーザーのid
   * @returns {TodoResponse[]} Todo配列
   */
  async findActiveGardenTodos(userId: string): Promise<TodoResponse[]> {
    const gardenId = await this.getActiveGardenId(userId);
    return await this.prismaService.todo.findMany({
      select: todoSelect,
      where: { gardenId },
    });
  }

  /**
   * 取り組み中(開始済かつ未完了)のTodoを取得する
   *
   * @param {string} id - 対象Todoのid
   * @param {string} userId - 所有ユーザーのid
   * @returns {Todo} 取り組み中のTodo
   * @throws {Error} 該当Todoが存在しない場合
   */
  private async getTodoInProgress(id: string, userId: string): Promise<Todo> {
    return await this.prismaService.todo.findFirstOrThrow({
      where: {
        id,
        userId,
        startedAt: { not: null },
        completedAt: null,
      },
    });
  }

  /**
   * アクティブなGardenにTodoを作成する
   *
   * @param {string} userId - 作成者のid
   * @param {CreateTodoDto} createTodoDto - 作成するTodoの内容
   * @returns {Todo} 作成したTodo
   */
  async create(userId: string, createTodoDto: CreateTodoDto): Promise<Todo> {
    const gardenId = await this.getActiveGardenId(userId);
    return await this.prismaService.todo.create({
      data: {
        ...createTodoDto,
        userId,
        gardenId,
      },
    });
  }

  /**
   * Todoを更新する
   *
   * @param {string} id - 更新するTodoのid
   * @param {string} userId - 更新するユーザのid
   * @param {UpdateTodoDto} updateTodoDto - 更新内容
   * @returns {Todo} 更新したTodo
   */
  async update(
    id: string,
    userId: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.prismaService.todo.update({
      where: { id, userId },
      data: { ...updateTodoDto },
    });
  }

  /**
   * 完了時のスコアと完了日時をTodoに反映する
   *
   * @param {Prisma.TransactionClient} tx - トランザクションクライアント
   * @param {string} id - 更新するTodoのid
   * @param {Score} score - 算出したスコア
   * @param {Date} completedAt - 完了日時
   * @returns {Todo} 更新したTodo
   */
  private async updateUponComplete(
    tx: Prisma.TransactionClient,
    id: string,
    score: Score,
    completedAt: Date,
  ): Promise<Todo> {
    return await tx.todo.update({
      where: { id },
      data: {
        score: score.rank,
        isCompleted: true,
        completedAt: completedAt,
      },
    });
  }

  /**
   * Todoを削除する
   *
   * @param {string} id - 削除するTodoのid
   * @param {string} userId - 削除するユーザのid
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.prismaService.todo.delete({
      where: { id, userId },
    });
  }

  /**
   * Todoのタイマーを起動する
   * 同一Garden内で同時に起動できるタイマーは1つのみ
   *
   * @param {string} id - タイマーを起動するTodoのid
   * @param {string} userId - 所有ユーザーのid
   * @returns {Todo} タイマーを起動したTodo
   * @throws {NotFoundException} 該当Todoが存在しない、または所有ユーザーが一致しない場合
   */
  async startTimer(id: string, userId: string): Promise<Todo> {
    // 指定Todoの取得
    const todo = await this.prismaService.todo.findFirst({
      where: { id, userId },
    });
    if (!todo) {
      throw new NotFoundException('TODOが見つかりません。');
    }

    // 他Todoのタイマー起動確認
    // NOTE: アクティブGardenではなくTodo自身のgardenIdで判定する
    const activeTodo = await this.prismaService.todo.findFirst({
      where: {
        gardenId: todo.gardenId,
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
          id,
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
   * @param {string} id - 完了させるTodoのid
   * @param {string} userId - 完了したTodoの所有ユーザーのid
   * @returns {PlantNodeResponse[]} 生成・保存されたノード配列
   */
  async complete(id: string, userId: string): Promise<PlantNodeResponse[]> {
    // 更新用Todo 作成
    const currentTodo = await this.getTodoInProgress(id, userId);
    const completeTodo: CompleteTodo = {
      startedAt: currentTodo.startedAt!,
      completedAt: new Date(),
      targetDuration: currentTodo.targetDuration,
    };

    // 更新用Score 作成
    const score: Score = this.calcScore(completeTodo);

    // 更新用Plant要素 作成
    // NOTE: アクティブGardenではなくTodo自身のgardenIdを使う
    // 期間リセット後に前期間のTodoを完了した際、別GardenのPlantに生えるため
    const plants = await this.plantService.getAllPlants(currentTodo.gardenId);
    if (plants.length === 0)
      throw new NotFoundException('Plantが見つかりませんでした。');
    const plantId = plants[Math.floor(Math.random() * plants.length)].id;

    // 更新用成長段階 作成
    const growthStat = await this.plantService.calcGrowthStage(
      plantId,
      score.nodeCount,
    );

    return await this.prismaService.$transaction(async (tx) => {
      const newNodes = await this.plantService.grow(
        tx,
        plantId,
        currentTodo.id,
        score.nodeCount,
        growthStat,
      );
      await this.updateUponComplete(
        tx,
        currentTodo.id,
        score,
        completeTodo.completedAt,
      );

      return newNodes;
    });
  }
}
