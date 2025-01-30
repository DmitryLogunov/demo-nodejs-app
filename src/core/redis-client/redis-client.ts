import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfiguration = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || '',
};

const redisClient = new Redis(redisConfiguration);

// TODO: add the validation of Redis configuration and client initialization

export default redisClient;
