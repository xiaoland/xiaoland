import { marked } from 'marked';

// Bundle every article markdown file at build time (Vite glob import)
const articleModules = import.meta.glob('/content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Article extends ArticleMeta {
  html: string;
}

/**
 * Parse YAML-style frontmatter from a raw markdown string.
 *
 * Supports:
 *   - Plain and quoted scalar values
 *   - Inline arrays: ['a', 'b']
 *   - Folded block scalars (>- / >): subsequent indented lines joined with spaces
 */
function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, string | string[]> = {};
  const lines = match[1].split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }

    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();

    if (val === '>-' || val === '>') {
      // YAML folded block scalar: collect indented lines and join with spaces
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && /^\s/.test(lines[i])) {
        blockLines.push(lines[i].trim());
        i++;
      }
      data[key] = blockLines.join(' ');
    } else if (val.startsWith('[') && val.endsWith(']')) {
      // Inline array: ['a', 'b'] or [a, b]
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      i++;
    } else {
      // Scalar: strip surrounding quotes
      data[key] = val.replace(/^['"]|['"]$/g, '');
      i++;
    }
  }

  return { data, content: match[2] ?? '' };
}

// Pre-process all articles once at module initialisation time
const articlesMap = new Map<string, Article>();

for (const [filePath, raw] of Object.entries(articleModules)) {
  const slug = filePath.split('/').pop()!.replace(/\.mdx?$/, '');
  const { data, content } = parseFrontmatter(raw);

  articlesMap.set(slug, {
    slug,
    title: (data['title'] as string) ?? 'Untitled',
    description: (data['description'] as string) ?? '',
    createdAt: (data['createdAt'] as string) ?? '',
    html: marked.parse(content, { async: false }) as string,
  });
}

/** All article metadata sorted newest-first. */
export function getArticles(): ArticleMeta[] {
  return [...articlesMap.values()]
    .map(({ slug, title, description, createdAt }) => ({
      slug,
      title,
      description,
      createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/** Full article (with rendered HTML) for a given slug, or null if not found. */
export function getArticle(slug: string): Article | null {
  return articlesMap.get(slug) ?? null;
}
