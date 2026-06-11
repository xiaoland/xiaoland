import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// 探测 Wrangler V3 本地 D1 数据库的实际路径
const getLocalD1DB = () => {
  try {
    const basePath = path.resolve(
      ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
    );
    const dbFile = fs.readdirSync(basePath).find((f) => f.endsWith(".sqlite"));
    return dbFile ? path.resolve(basePath, dbFile) : "";
  } catch (err) {
    return "";
  }
};

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  ...(process.env.NODE_ENV !== "production" && {
    dbCredentials: {
      url: getLocalD1DB(),
    },
  }),
});
