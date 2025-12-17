import { ClientSession, Connection } from 'mongoose';

export async function withMongoTransaction<T>(
  connection: Connection,
  handler: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await handler(session);
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return result!;
  } finally {
    await session.endSession();
  }
}

