# Articles

This directory contains articles that will be rendered on the website with server-side rendering (SSR).

## Structure

Each article should be in its own directory following this pattern:

```
articles/
  └── {slug}/
      ├── {slug}.{md,mdx}
      └── [assets referenced by this article]
```

## Creating a New Article

1. Create a new directory with your article slug (e.g., `my-article`)
2. Create a MDX file with the same name (e.g., `my-article.mdx`)
3. Add frontmatter at the top of your MDX file:

```mdx
---
title: Your Article Title
description: Your article preface, conclusion or etc.
publishTo: array of "wxoa", ...
createdAt: ISO8601 format datetime string
---

Your article content here...
```

4. The article will be automatically available at `/article/{slug}`
