import { drizzle } from 'drizzle-orm/d1';

export const getDb = (D1: any) => {
  return drizzle(D1);
};
