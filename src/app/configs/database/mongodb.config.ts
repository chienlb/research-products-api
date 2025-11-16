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
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if server selection fails
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
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
