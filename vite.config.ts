import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const devServerHost = process.env.HOST;
const devServerPort = process.env.PORT
  ? Number.parseInt(process.env.PORT, 10)
  : undefined;

export default defineConfig(({ command }) => {
  const server = {
    host: devServerHost,
    port: devServerPort,
    proxy: {
      "/api": "https://api.xiaoland.localhost",
    },
  };

  return {
    root: "public",
    publicDir: false,
    server: {
      ...server,
      watch: {
        ignored: ["!**/public/**"],
      },
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
    },
    plugins: [cloudflare()],
  };
});
