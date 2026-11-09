import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setup } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

describe('e2e-test', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setup(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRaw`
    TRUNCATE TABLE "User", "Garden", "Todo", "Seed", "Plant", "PlantNode", "PlantEdge" CASCADE
    `;
  });

  afterAll(async () => await app.close());

  it('正常系: Todo を完了する場合、ノードが1つ増える', async () => {
    const agent = request.agent(app.getHttpServer());

    // signup
    await agent
      .post('/auth/signup')
      .send({
        name: 'e2e-test',
        email: 'e2e@example.com',
        password: 'E2e.1234',
      })
      .expect(201);

    // signin
    await agent
      .post('/auth/signin')
      .send({
        email: 'e2e@example.com',
        password: 'E2e.1234',
      })
      .expect(200);

    // create todo
    const res = await agent
      .post('/todos')
      .send({
        title: 'todo-e2e-test',
      })
      .expect(201);

    const todoId = (res.body as { id: string }).id;

    // start todo
    await agent.patch(`/todos/${todoId}/start`).expect(200);

    // complete todo
    const befNodeCnt = await prisma.plantNode.count();
    await agent.patch(`/todos/${todoId}/complete`).expect(200);
    const aftNodeCnt = await prisma.plantNode.count();

    // increase node
    expect(aftNodeCnt - befNodeCnt).toBe(1);
  });

  it('異常系: 未認証で Todo 一覧を取得する場合 401 を返す', async () => {
    await request(app.getHttpServer()).get('/todos').expect(401);
  });
});
