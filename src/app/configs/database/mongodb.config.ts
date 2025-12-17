import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { envSchema } from '../env/env.config';
import { Connection, ConnectionStates } from 'mongoose';

const logger = new Logger('MongoDB');

export const MongoDBModule = MongooseModule.forRootAsync({
  useFactory: () => {
    const env = envSchema.parse(process.env);
    const uri = env.MONGODB_URI;
    return {
      uri,
      serverSelectionTimeoutMS: 30000,
      // socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      bufferTimeoutMS: 60000,
      connectionFactory: (connection: Connection) => {
        logger.log('Connecting to MongoDB...');

        const onConnected = () =>
          logger.log('MongoDB connection opened and ready.');
        if (connection.readyState === ConnectionStates.connected) onConnected();
        else {
          connection.once('connected', onConnected);
          connection.once('open', onConnected);
        }

        connection.on('disconnected', () =>
          logger.warn('MongoDB connection lost.'),
        );
        connection.on('reconnected', () => logger.log('MongoDB reconnected.'));
        connection.on('error', (err: Error) =>
          logger.error(`MongoDB connection error: ${err.message}`),
        );

        return connection;
      },
    };
  },
});
