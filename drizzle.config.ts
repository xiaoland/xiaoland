import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    wranglerConfigPath: './wrangler.jsonc',
    dbName: 'site',
  },
});
