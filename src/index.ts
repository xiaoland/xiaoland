import { Hono } from 'hono';
import { layout } from './templates/layout.js';
import { homePage } from './templates/home.js';
import { articlePage } from './templates/article.js';
import { getArticle, getArticles } from './utils/markdown.js';

type Env = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

// Home page
app.get('/', (c) => {
  const articles = getArticles();
  const isHtmx = c.req.header('HX-Request') === 'true';
  const body = homePage({ articles });
  return c.html(isHtmx ? body : layout({ title: 'Xiaoland', body }));
});

// Article page
app.get('/article/:slug', (c) => {
  const slug = c.req.param('slug');
  const article = getArticle(slug);
  if (!article) {
    return c.notFound();
  }
  const isHtmx = c.req.header('HX-Request') === 'true';
  const body = articlePage({ article });
  return c.html(isHtmx ? body : layout({ title: article.title, body }));
});

export default app;
