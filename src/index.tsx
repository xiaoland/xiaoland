import { Hono } from "hono";
import articleApp from "./article";
import commentApp from "./comment";
import { Home } from "./home";
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";
import { HonoContextT } from "./types";

const app = new Hono<HonoContextT>();

app.use(
  jsxRenderer(({ children }, c) => {
    const pageTitle = c.get("title");
    const title = pageTitle ? `${pageTitle} - lanzhijiang` : "lanzhijiang";
    const description = c.get("description") || "lanzhijiang's blog";
    const canonicalUrl = c.get("canonicalUrl") || `https://lanzhijiang.com${c.req.path}`;
    const ogImage = c.get("ogImage") || "https://lanzhijiang.com/default-og-image.png";
    
    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonicalUrl} />
          
          {/* Open Graph */}
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={ogImage} />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={ogImage} />
          
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
app.route("/api/comment", commentApp);

export default app;
