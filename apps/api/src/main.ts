import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
