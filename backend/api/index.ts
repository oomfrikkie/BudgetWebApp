import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

const server = express();

let isReady = false;

async function bootstrap() {
  if (isReady) return server;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors({ origin: process.env.FRONTEND_URL || '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  isReady = true;
  return server;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
