import { Injectable } from '@nestjs/common';
import { Garden } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GardenService {
  constructor(private readonly prismaService: PrismaService) {}

  // ユーザーの今月(Active)のGardenを取得する
  async getActive(userId: string): Promise<Garden | null> {
    return await this.prismaService.garden.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });
  }
}
