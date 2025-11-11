import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import type { Express } from 'express';
import { envSchema } from './app/configs/env/env.config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpExceptionFilter } from './app/common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const env = envSchema.parse(process.env);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const allowedOrigins: string[] = (() => {
    const v = env.CORS_ORIGINS;
    if (!v) return [];
    if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
    return String(v)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  })();

  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const msg = `CORS policy: No access from origin ${origin}. Allowed: ${allowedOrigins.join(', ')}`;
        callback(new Error(msg));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 600,
  };

  app.enableCors(corsOptions);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const maxReq = Number(env.RATE_LIMIT_MAX ?? 100);
  app.use(
    rateLimit({
      windowMs,
      max: maxReq,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.',
      },
    }),
  );

  app.use(json({ limit: env.BODY_LIMIT_JSON ?? '1mb' }));
  app.use(
    urlencoded({ limit: env.BODY_LIMIT_URLENCODED ?? '1mb', extended: true }),
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  app.use(compression());

  if (env.API_PREFIX) {
    const cleanPrefix = String(env.API_PREFIX).replace(/^\/+|\/+$/g, '');
    if (cleanPrefix) app.setGlobalPrefix(cleanPrefix);
  }

  if (String(env.TRUST_PROXY ?? 'true') === 'true') {
    const httpInstance = app.getHttpAdapter().getInstance() as Express;
    httpInstance.set('trust proxy', 1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');

  app.useGlobalFilters(new HttpExceptionFilter());

  logger.log(`🚀 App running on http://0.0.0.0:${port}`);

  const gracefulShutdown = async (reason: string, code = 0): Promise<void> => {
    try {
      logger.warn(`Shutting down gracefully (${reason})...`);
      await app.close();
      logger.log('Cleanup done. Bye!');
      process.exit(code);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT', 0);
  });
  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM', 0);
  });
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
    void gracefulShutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    void gracefulShutdown('uncaughtException', 1);
  });
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
