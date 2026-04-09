import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GrowthStage,
  PlantNode,
  Todo,
  TodoScore,
} from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 少数を含むランダムな値を生成（範囲：min <= return <= max）
   * @param min
   * @param max
   * @returns
   */
  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

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

  async startTimer(todoId: string, gardenId: string): Promise<Todo> {
    // 同時起動チェック
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

    // タイマー開始
    return await this.prismaService.todo.update({
      where: {
        id: todoId,
        startedAt: null,
      },
      data: { startedAt: new Date() },
    });
  }

  async complete(todoId: string, plantId: string): Promise<PlantNode[]> {
    // タイマー起動中のTODOか確認
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

    // completeAt生成
    const startedAt = currentTodo.startedAt;
    const targetDuration = currentTodo.targetDuration;
    const completedAt = new Date();

    // スコアリング
    if (targetDuration) {
      if (startedAt) {
        // 取り組んだ時間(秒)
        const timeSpent: number =
          (completedAt.getTime() - startedAt?.getTime()) / 1000;
        // 目標値と実値の差分率
        const changeRate: number =
          Math.abs(timeSpent - targetDuration) / targetDuration;

        // ノード生成数算出
        const calcScore = () => {
          if (changeRate <= 0.05) {
            // TODO:特殊演出
            return { rank: TodoScore.S, nodeCount: 5 };
          } else if (changeRate <= 0.1) {
            return { rank: TodoScore.A, nodeCount: 4 };
          } else if (changeRate <= 0.25) {
            return { rank: TodoScore.B, nodeCount: 3 };
          } else if (changeRate <= 0.5) {
            return { rank: TodoScore.C, nodeCount: 2 };
          } else {
            return { rank: TodoScore.D, nodeCount: 1 };
          }
        };
        const score = calcScore();

        const selectPlant = await this.prismaService.plant.findUnique({
          where: { id: plantId },
          include: { plantNodes: true },
        });
        if (selectPlant) {
          type CreatedNode = {
            hue: number;
            size: number;
            length: number;
            depth: number;
            parentId: string;
            todoId: string;
            plantId: string;
          };
          const createdNodes: CreatedNode[] = [];

          // plantNode生成
          // 2週目以降対象PlantのplantNodesが更新されない？
          for (let i = 0; i < score.nodeCount; i++) {
            // 親ノードランダム決定
            // TODO: MAX_CHILDREN = 3;
            const nodeIndex: number = Math.floor(
              Math.random() * selectPlant.plantNodes.length,
            );
            const parentNode: PlantNode = selectPlant.plantNodes[nodeIndex];

            if (parentNode) {
              if (selectPlant.plantNodes.length === 0) {
                throw new BadRequestException('Plantにノードが存在しません。');
              }
              // 子ノード生成(色相やサイズは親ノードからそのまま遺伝)
              const childNode: CreatedNode = {
                hue: Math.max(80, 120 - parentNode.depth * 4),
                size: Math.max(3, parentNode.size * this.random(0.65, 0.88)),
                length: Math.max(5, parentNode.length * this.random(0.8, 1.1)),
                depth: parentNode.depth + 1,
                parentId: parentNode.id,
                todoId: currentTodo.id,
                plantId: selectPlant.id,
              };

              createdNodes.push(childNode);
            } else {
              throw new BadRequestException('親ノードが見つかりません。');
            }
          }

          // Plant成長段階算出
          const updatedNodeCnt = selectPlant.nodeCount + score.nodeCount;
          const calcGrowthStage = (): GrowthStage => {
            if (updatedNodeCnt <= 5) return GrowthStage.SPROUT;
            else if (updatedNodeCnt <= 15) return GrowthStage.YOUNG;
            else if (updatedNodeCnt <= 30) return GrowthStage.MATURE;
            else return GrowthStage.BLOOM;
          };
          const growthStage = calcGrowthStage();
          if (selectPlant.growthStage !== growthStage) {
            // TODO: 成長段階が上がった場合の演出
          }

          // DB反映
          const [resPlant, resNodes, resTodo] =
            await this.prismaService.$transaction([
              // plant更新
              this.prismaService.plant.update({
                where: {
                  id: selectPlant.id,
                },
                data: {
                  nodeCount: updatedNodeCnt,
                  growthStage,
                },
              }),
              // node生成
              this.prismaService.plantNode.createManyAndReturn({
                data: [...createdNodes],
              }),
              // todo更新
              this.prismaService.todo.update({
                where: {
                  id: currentTodo.id,
                },
                data: {
                  score: score.rank,
                  isCompleted: true,
                  completedAt,
                },
              }),
            ]);

          return resNodes;
        } else {
          throw new NotFoundException('選択したPlantが見つかりません。');
        }
      } else {
        throw new NotFoundException('現在取り組んでいるタスクが存在しません。');
      }
    } else {
      // 1node
      const resNodes: PlantNode[] = [];
      const score = { rank: TodoScore.D, nodeCount: 1 };

      const selectPlant = await this.prismaService.plant.findUnique({
        where: { id: plantId },
        include: { plantNodes: true },
      });

      if (selectPlant) {
        // 親ノードランダム決定
        const nodeIndex: number = Math.floor(
          Math.random() * selectPlant.plantNodes.length,
        );
        const parentNode: PlantNode = selectPlant.plantNodes[nodeIndex];

        // Plant成長段階算出
        const updatedNodeCnt = selectPlant.nodeCount + score.nodeCount;
        const calcGrowthStage = (): GrowthStage => {
          if (updatedNodeCnt <= 5) return GrowthStage.SPROUT;
          else if (updatedNodeCnt <= 15) return GrowthStage.YOUNG;
          else if (updatedNodeCnt <= 30) return GrowthStage.MATURE;
          else return GrowthStage.BLOOM;
        };
        const growthStage = calcGrowthStage();
        if (selectPlant.growthStage !== growthStage) {
          // TODO: 成長段階が上がった場合の演出
        }

        const [resPlant, resNode, resTodo] =
          await this.prismaService.$transaction([
            // plant更新
            this.prismaService.plant.update({
              where: {
                id: selectPlant.id,
              },
              data: {
                nodeCount: { increment: score.nodeCount },
                growthStage,
              },
            }),
            // node生成
            this.prismaService.plantNode.create({
              data: {
                hue: Math.max(80, 120 - parentNode.depth * 4),
                size: Math.max(3, parentNode.size * this.random(0.65, 0.88)),
                length: Math.max(5, parentNode.length * this.random(0.8, 1.1)),
                depth: parentNode.depth + 1,
                parentId: parentNode.id,
                todoId: currentTodo.id,
                plantId: selectPlant.id,
              },
            }),
            // todo更新
            this.prismaService.todo.update({
              where: {
                id: currentTodo.id,
              },
              data: {
                score: score.rank,
                isCompleted: true,
                completedAt,
              },
            }),
          ]);

        resNodes.push(resNode);
        return resNodes;
      } else {
        throw new NotFoundException('選択したPlantが見つかりません。');
      }
    }
  }
}
