import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient, Script } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>lanzhijiang</title>
        <Link href="/src/style.css" />
        <ViteClient />
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
});
