import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export const setup = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
};
