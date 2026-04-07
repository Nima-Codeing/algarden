import {
  GardenPeriod,
  PrismaClient,
  SeedType,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// DB Access setting
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Client setting
const prisma = new PrismaClient({
  adapter,
});

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
      email: 'dev@algarden.com',
      password: await bcrypt.hash('dev', 10),
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
        targetDuration: 900,
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
