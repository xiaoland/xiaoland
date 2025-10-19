# Articles

This directory contains articles that will be rendered on the website with server-side rendering (SSR).

## Structure

Each article should be in its own directory following this pattern:

```
articles/
  └── {slug}/
      ├── {slug}.mdx
      └── [images and other assets]
```

## Creating a New Article

1. Create a new directory with your article slug (e.g., `my-article`)
2. Create a MDX file with the same name (e.g., `my-article.mdx`)
3. Add frontmatter at the top of your MDX file:

```mdx
---
title: Your Article Title
---

Your article content here...
```

4. The article will be automatically available at `/article/{slug}`

## Example

See `google-cn-issue/` for a complete example.

## Features

- ✅ Server-side rendering (SSR) for SEO
- ✅ Frontmatter support for metadata
- ✅ Images and assets support
- ✅ Full MDX support (JSX in Markdown)
