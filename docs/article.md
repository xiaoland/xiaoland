# Article 页面实现思路

## 概述

Article 页面实现了基于 Cloudflare Workers 和 Hono 框架的服务器端渲染 (SSR) 博客文章系统，支持动态路由和 MDX 内容渲染。

## 架构设计

### 1. 路由结构

- 主页：`/` - 展示欢迎页面
- 文章页：`/article/:slug` - 根据 slug 参数动态渲染文章

### 2. 文件组织

```text
articles/
  └── {slug}/
      ├── {slug}.mdx    # MDX 文章内容
      └── [assets]/     # 文章相关资源
```

### 3. 技术栈

- **框架**：Hono (轻量级 Web 框架)
- **渲染**：vite-ssr-components (SSR 支持)
- **构建**：Vite + Cloudflare Workers 插件
- **内容处理**：MDX (支持 JSX 和 Markdown) + remark 插件生态

## 核心实现

### 1. 渲染器 (renderer.tsx)

```typescript
export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>lanzhijiang</title>
        <Link href="/src/style.css" />
      </head>
      <body>
        <div id="app">
          {children}
        </div>
        <ViteClient />
      </body>
    </html>
  )
})
```

**设计考虑**：

- 提供完整的 HTML 文档结构
- 支持客户端 hydration
- 包含必要的 meta 标签和样式链接

### 2. 路由处理

#### 主路由 (index.tsx)

```typescript
import { Hono } from "hono";
import { renderer } from "./renderer";
import articleApp from "./article";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.html(`
    <h1>Welcome to lanzhijiang</h1>
    <p>This is the homepage.</p>
  `);
});

app.route("/article", articleApp);

export default app;
```

#### 文章路由 (article.tsx)

```typescript
import { Hono } from "hono";

const articles = import.meta.glob("../../articles/**/*.mdx", {
  eager: true,
});

const articleApp = new Hono();

articleApp.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const articlePath = `../../articles/${slug}/${slug}.mdx`;

  const articleModule = articles[articlePath] as any;

  if (!articleModule) {
    return c.text("Article not found", 404);
  }

  const { default: ArticleComponent, frontmatter } = articleModule;

  return c.render(
    <article>
      <h1>{frontmatter.title || "Untitled"}</h1>
      <ArticleComponent />
    </article>
  );
});

export default articleApp;
```

### 3. MDX 配置 (vite.config.ts)

```typescript
import mdx from '@mdx-js/rollup'
import rehypeMdxImportMedia from 'rehype-mdx-import-media'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin(), mdx({
    jsxImportSource: 'hono/jsx',
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [rehypeMdxImportMedia]
  })]
})
```

## Frontmatter 解析修复 (2025-10-24)

### 问题描述

`article.tsx` 中无法正确解析 MDX 文件的 frontmatter，导致文章标题显示为 "Untitled"。

### 根本原因

初始 MDX 配置使用了 `remarkParseFrontmatter`，该插件仅将 frontmatter 解析到文件数据中，但不会将其导出为 ES 模块的命名导出。因此，在 `article.tsx` 中解构 `{ frontmatter }` 时得到 `undefined`。

### 解决方案

替换为 `remark-mdx-frontmatter` 插件，该插件会自动将解析后的 frontmatter 导出为模块的 `frontmatter` 命名导出。

**变更详情：**

1. 移除 `remarkParseFrontmatter`
2. 添加 `remark-mdx-frontmatter` 依赖
3. 更新 Vite 配置中的 remark 插件列表

**代码变更：**

```diff
- import remarkParseFrontmatter from 'remark-parse-frontmatter'
+ import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

remarkPlugins: [
  remarkFrontmatter,
- remarkParseFrontmatter,
+ remarkMdxFrontmatter
]
```

### 验证方法

构建项目后，访问 `/article/{slug}` 路由应正确显示 frontmatter 中的标题。

## 技术决策

### 1. 为什么切换到 MDX？

- 支持在 Markdown 中嵌入 JSX 组件
- 更好的图片和资源处理能力
- 丰富的插件生态系统
- 保持 Markdown 的简单性同时提供扩展性

### 2. 为什么使用 remark 插件处理 frontmatter？

- 标准化 YAML frontmatter 解析
- 自动导出 frontmatter 数据
- 避免自定义解析器的维护负担
- 与 MDX 生态系统无缝集成

### 3. 为什么使用 rehype-mdx-import-media 处理图片？

- 自动将相对路径图片引用转换为 import 语句
- 支持 Vite 的资源处理和优化
- 无需手动管理图片导入
- 保持 Markdown 语法的简洁性

### 4. 为什么分离路由到独立文件？

- 提高代码组织性和可维护性
- 支持模块化开发
- 便于后续功能扩展

## 内容格式

### MDX 文章示例

```markdown
---
title: 文章标题
---

这是文章内容。

![图片描述](./image.png)

<CustomComponent />
```

**特性**：

- YAML frontmatter 支持
- 自动图片资源处理
- JSX 组件支持
- Markdown 语法完整支持

## 扩展性考虑

### 1. 内容缓存

- 可以集成 Cloudflare KV 存储缓存渲染结果
- 支持 CDN 缓存优化性能

### 2. 搜索功能

- 基于 frontmatter 和内容构建索引
- 支持全文搜索

### 3. 文章列表

- 扩展主页显示文章列表
- 支持分页和分类

### 4. 富媒体支持

- 图片自动优化和打包 ✓
- 支持代码语法高亮
- 添加数学公式渲染

## 部署和维护

### 构建流程

```bash
pnpm run build    # 生产构建
pnpm run deploy   # 部署到 Cloudflare Workers
```

### 监控和调试

- Cloudflare Workers 控制台
- 本地开发服务器 (`pnpm run dev`)
- 错误日志和性能监控

## 总结

该实现通过 MDX 和现代构建工具提供了强大的内容渲染能力。核心设计遵循 Cloudflare Workers 的约束，同时保持代码的可维护性和功能的完整性。图片资源的自动处理和模块化的路由设计为后续扩展奠定了良好基础。
