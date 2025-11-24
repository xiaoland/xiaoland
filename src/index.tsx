import { Hono } from "hono";
import articleApp from "./article";
import commentApp from "./comment";
import { Home } from "./home";
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";
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
          <Link rel="stylesheet" href="/dist/uno.css" />
          <Link rel="stylesheet" href="/src/style.css" />
          <ViteClient />
        </head>
        <body>
          <div id="app">{children}</div>
        </body>
      </html>
    );
  })
);

app.get("/", (c) => {
  return c.render(<Home />);
});

app.route("/article", articleApp);
app.route("/comment", commentApp);

export default app;
