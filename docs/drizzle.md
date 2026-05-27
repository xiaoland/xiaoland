## drizzle.config.ts

drizzle.config.ts 不会在运行时被加载，只有在你使用 drizzle-kit 打开 studio 或者运行 migrations 时才会加载，.所以其中并不需要特别地配置 dbCredentials 除非你想连接在云端的 Cloudflare D1。

本地开发时，wrangler 实际上会根据 wrangler.toml 在本地模拟一个和生产环境一致的 Cloudflare D1，你可以通过下面的方式获取到它的 URL 并使得 drizzle-kit 在本地开发时自动连接到它：

```ts
import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// 探测 Wrangler V3 本地 D1 数据库的实际路径
const getLocalD1DB = () => {
  try {
    const basePath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    const dbFile = fs.readdirSync(basePath).find((f) => f.endsWith('.sqlite'));
    return dbFile ? path.resolve(basePath, dbFile) : '';
  } catch (err) {
    return '';
  }
};

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // 如果找到了本地数据库，就让 Drizzle Studio 连上去
  ...(process.env.NODE_ENV !== 'production' && {
    dbCredentials: {
      url: getLocalD1DB(),
    },
  }),
});
```

## Schema 定义

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});
```

另外可以导出表操作类型，方便 service 层使用

```ts
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
```

并且为了更好的 service 层开发体验，还可以添加 db/index.ts 导出带有表类型的数据库类型：

```ts
import * as schema from '../db/schema';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export type DB = DrizzleD1Database<typeof schema>;
```
