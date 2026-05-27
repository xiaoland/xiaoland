import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import devServer, { defaultOptions } from '@hono/vite-dev-server';
import ssg from '@hono/vite-ssg';

const devServerHost = process.env.HOST;
const devServerPort = process.env.PORT
  ? Number.parseInt(process.env.PORT, 10)
  : undefined;

export default defineConfig(({ command, mode }) => {
  const server = {
    host: devServerHost,
    port: devServerPort,
    proxy:
      mode === 'ssg'
        ? {
            '/api': 'http://127.0.0.1:8787',
          }
        : undefined,
  };

  if (mode === 'ssg') {
    return {
      plugins: [
        command === 'serve'
          ? devServer({
              entry: 'src/ssg/app.ts',
              exclude: [
                /^\/api\/.*/,
                /^\/assets\/.*/,
                /^\/images\/.*/,
                /^\/uno\.css$/,
                ...defaultOptions.exclude,
              ],
            })
          : ssg({
              entry: './src/ssg/app.ts',
            }),
      ],
      server,
    };
  }

  return {
    plugins: [cloudflare()],
    server,
  };
});
