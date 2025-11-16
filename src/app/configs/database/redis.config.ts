import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Logger } from '@nestjs/common';
import { envSchema } from '../env/env.config';

const logger = new Logger('Redis');

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (): Promise<RedisClientType> => {
        const env = envSchema.parse(process.env);

        const redisClient: RedisClientType = createClient({
          url: env.REDIS_URL,
          socket: {
            connectTimeout: 5000, // Fail after 5 seconds
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                logger.error('Too many Redis reconnection attempts, stopping.');
                return new Error('Unable to connect to Redis');
              }
              logger.warn(`Retrying Redis connection (attempt ${retries})...`);
              return Math.min(retries * 50, 500);
            },
          },
        });

        // Log connection events
        redisClient.on('connect', () => logger.log('Redis connecting...'));
        redisClient.on('ready', () => logger.log('Redis is ready.'));
        redisClient.on('end', () => logger.log('Redis connection closed.'));
        redisClient.on('reconnecting', () =>
          logger.log('Attempting to reconnect to Redis...'),
        );
        redisClient.on('error', (err: Error) =>
          logger.error(`Redis error: ${err.message}`),
        );

        try {
          // Add timeout to connection attempt
          const connectPromise = redisClient.connect();
          const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Redis connection timeout after 10 seconds'));
            }, 10000);
          });

          await Promise.race([connectPromise, timeoutPromise]);
          logger.log('Successfully connected to Redis.');
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(`Failed to connect to Redis: ${message}`);
          // Close the client if connection failed
          try {
            await redisClient.quit();
          } catch {
            // Ignore errors during cleanup
          }
          throw new Error(`Redis connection failed: ${message}`);
        }

        return redisClient;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnModuleDestroy {
  constructor() {
    logger.log('RedisModule initialized.');
  }

  async onModuleDestroy() {
    try {
      // Parse lại env để lấy URL đóng kết nối
      const env = envSchema.parse(process.env);
      const client: RedisClientType = createClient({ url: env.REDIS_URL });
      await client.quit();
      logger.log('Redis connection closed gracefully.');
    } catch (err) {
      logger.error('Error while closing Redis connection:', err);
    }
  }
}
