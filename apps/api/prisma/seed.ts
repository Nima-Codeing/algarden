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

  const ONE_DAY = 24 * 60;
  const minutesAgo = (minutes: number) =>
    new Date(Date.now() - minutes * 60 * 1000);
  const devTodos = await prisma.todo.createManyAndReturn({
    data: [
      {
        title: 'Task-1',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(10),
      },
      {
        title: 'Task-2',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(20),
      },
      {
        title: 'Task-3',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(30),
      },
      {
        title: 'Task-4',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(40),
      },
      {
        title: 'Task-5',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(50),
      },
      {
        title: 'Task-6',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: minutesAgo(60),
      },
      {
        title: 'Task-7',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: minutesAgo(70),
      },
      {
        title: 'Task-8',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: minutesAgo(80),
      },
      {
        title: 'Task-9',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: minutesAgo(90),
      },
      {
        title: 'Task-10',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: minutesAgo(100),
      },
      {
        title: 'Task-0',
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(0),
      },
      {
        title: 'Task-yesterday-1',
        isCompleted: true,
        score: 'D',
        userId: devUser.id,
        gardenId: devGarden.id,
        startedAt: minutesAgo(ONE_DAY),
        completedAt: minutesAgo(ONE_DAY),
        createdAt: minutesAgo(ONE_DAY + 10),
      },
      {
        title: 'Task-yesterday-3',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(ONE_DAY + 30),
      },
      {
        title: 'Task-yesterday-2',
        targetDuration: 1800,
        userId: devUser.id,
        gardenId: devGarden.id,
        createdAt: minutesAgo(ONE_DAY + 20),
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
        todoId: devTodos[6].id,
        parentId: devRootNode.id,
        plantId: devPlant.id,
      },
      {
        x: 60,
        y: 20,
        hue: 116,
        size: 8,
        depth: 1,
        todoId: devTodos[7].id,
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
