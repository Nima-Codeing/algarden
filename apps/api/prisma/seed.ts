import { PrismaPg } from '@prisma/adapter-pg';

import { hashPassword } from 'src/auth/hash-password';
import { DateService } from 'src/common/date/date.service';
import { EdgeType, PrismaClient } from '../generated/prisma/client';

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
      email: 'dev@al.com',
      password: await hashPassword('Dev.9999'),
    },
  });

  const nextMonthFirstDay = new DateService().getNextMonthFirstDayUTC();
  const devGarden = await prisma.garden.create({
    data: {
      userId: devUser.id,
      endAt: nextMonthFirstDay,
    },
  });

  const devTodos = await prisma.todo.createManyAndReturn({
    data: [
      {
        title: 'Task-A',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
      },
      {
        title: 'Task-B',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
      },
      {
        title: 'Task-C',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
      },
      {
        title: 'Task-2',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
      },
      {
        title: 'Task-3',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ],
  });

  const devSeed = await prisma.seed.create({
    data: {
      x: 0,
      y: 0,
      gardenId: devGarden.id,
    },
  });

  const devPlant = await prisma.plant.create({
    data: {
      gardenId: devGarden.id,
      seedId: devSeed.id,
    },
  });

  const devRootNode = await prisma.plantNode.create({
    data: {
      x: 0,
      y: 0,
      hue: 120,
      size: 10,
      depth: 0,
      plantId: devPlant.id,
    },
  });

  const [devNode1, devNode2] = await prisma.plantNode.createManyAndReturn({
    data: [
      {
        x: 40,
        y: -30,
        hue: 116,
        size: 8,
        depth: 1,
        todoId: devTodos[1].id,
        parentId: devRootNode.id,
        plantId: devPlant.id,
      },
      {
        x: 60,
        y: 20,
        hue: 116,
        size: 8,
        depth: 1,
        todoId: devTodos[2].id,
        parentId: devRootNode.id,
        plantId: devPlant.id,
      },
    ],
  });

  await prisma.plantEdge.createMany({
    data: [
      {
        fromId: devRootNode.id,
        toId: devNode1.id,
        edgeType: EdgeType.SKELETON,
        plantId: devPlant.id,
      },
      {
        fromId: devRootNode.id,
        toId: devNode2.id,
        edgeType: EdgeType.SKELETON,
        plantId: devPlant.id,
      },
      {
        fromId: devNode2.id,
        toId: devNode1.id,
        edgeType: EdgeType.SPREAD,
        plantId: devPlant.id,
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
