import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessions, users } from '@drizzle/schema';
import { getDb } from './db';

export const getLucia = (D1: any) => {
  const db = getDb(D1);
  const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: true,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
      };
    },
  });
};

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof getLucia>;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}
