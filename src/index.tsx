import { Hono } from "hono";
import articleApp from "./article";
import commentApp from "./comment";
import { Home } from "./home";
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";
import { createGenerator } from "@unocss/core";
import unoConfig from "../uno.config";
import { HonoContextT } from "./types";

const app = new Hono<HonoContextT>();

app.use(
  jsxRenderer(({ children }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>lanzhijiang</title>
          <Link href="/src/style.css" rel="stylesheet" />
          <ViteClient />
        </head>
        <body>
          <div id="app">{children}</div>
        </body>
      </html>
    );
  })
);

const uno = await createGenerator(unoConfig);
app.use(async (c, next) => {
  await next();

  // Only process HTML responses
  const contentType = c.res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return;

  // Read response body as text
  // c.res is a Response object; use its text() method:
  const originalHtml = await c.res.text();

  // Generate UnoCSS for the rendered HTML
  const { css } = await uno.generate(originalHtml, { minify: true });

  // Inject the generated CSS before </head>. Fallback: prepend if </head> not found
  let htmlWithCss: string;
  if (originalHtml.includes("</head>")) {
    htmlWithCss = originalHtml.replace(
      "</head>",
      `<style id="unocss-ssr">${css}</style></head>`
    );
  } else {
    // fallback: insert at top
    htmlWithCss = `<style id="unocss-ssr">${css}</style>` + originalHtml;
  }

  // Recreate the Response preserving status and headers
  const headers = new Headers(c.res.headers);
  // If content-length exists, remove or update it (we replaced body size)
  headers.delete("content-length");

  c.res = new Response(htmlWithCss, {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  });
});

app.get("/", (c) => {
  return c.render(<Home />);
});

app.route("/article", articleApp);
app.route("/comment", commentApp);

export default app;
