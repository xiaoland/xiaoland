/** @jsxImportSource react */
import { createRoot } from "react-dom/client";
import { ArticleComments } from "./ArticleComments";

// Hydrate the ArticleComments component
const container = document.getElementById("article-comments");
if (container) {
  const slug = container.dataset.slug;
  if (slug) {
    const root = createRoot(container);
    root.render(<ArticleComments slug={slug} />);
  }
}
