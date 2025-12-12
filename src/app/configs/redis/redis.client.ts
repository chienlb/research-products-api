import Redis from 'ioredis';
import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";

dotenv.config();

const logger = new Logger('Redis');

export const redis = new Redis(
    process.env.REDIS_URL as string,
    {
        maxRetriesPerRequest: null,
        tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
    }
);

redis.on('connect', () => {
    logger.log('Connect to Redis successfully');
});

redis.on('error', (err) => {
    logger.error('Error connect to Redis', err);
});
