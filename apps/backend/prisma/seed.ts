import * as argon2 from 'argon2';
import {
  GardenPeriod,
  PrismaClient,
  SeedType,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// DB Access setting
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Client setting
const prisma = new PrismaClient({
  adapter,
});

async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  return hash;
}

// main
export async function main() {
  await prisma.garden.deleteMany();
  await prisma.user.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.seed.deleteMany();
  await prisma.plant.deleteMany();

  const devUser = await prisma.user.create({
    data: {
      name: 'dev',
      email: 'dev@gmail.com',
      password: await hashPassword('Devlop999'),
    },
  });

  const devGarden = await prisma.garden.create({
    data: {
      periodType: GardenPeriod.MONTHLY,
      userId: devUser.id,
    },
  });

  const devTodos = await prisma.todo.createManyAndReturn({
    data: [
      {
        title: 'ランニング',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
      },
      {
        title: '筋トレ',
        userId: devUser.id,
        gardenId: devGarden.id,
      },
    ],
  });

  const devSeed = await prisma.seed.create({
    data: {
      px: 0,
      py: 0,
      seedType: SeedType.DFS,
      gardenId: devGarden.id,
    },
  });

  const devPlant = await prisma.plant.create({
    data: {
      gardenId: devGarden.id,
      seedId: devSeed.id,
    },
  });

  const devPlantNode = await prisma.plantNode.create({
    data: {
      hue: 120,
      size: 10,
      length: 30,
      plantId: devPlant.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
