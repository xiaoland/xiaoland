/** @jsxImportSource react */
import { createRoot } from "react-dom/client";
import { TableOfContents } from "./TableOfContents";

// Hydrate the TableOfContents component
const container = document.getElementById("article-toc");
if (container) {
  const root = createRoot(container);
  root.render(<TableOfContents />);
}
