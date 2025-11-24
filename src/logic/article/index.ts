import { ArticleModule, ArticleMetadata, ArticleFrontmatter } from "./types";

// Import articles dynamically
export const articles = import.meta.glob("../../../articles/**/*.{md,mdx}", {
    eager: true,
});

/**
 * Complete missing frontmatter fields with default values
 */
function completeArticleFrontmatter(frontmatter: ArticleFrontmatter = {}, slug: string): Required<ArticleFrontmatter> {
    const now = new Date().toISOString();

    return {
        title: frontmatter.title || "Untitled",
        description: frontmatter.description || "",
        publishTo: frontmatter.publishTo || [],
        createdAt: frontmatter.createdAt || now,
    };
}

/**
 * Get article module by slug
 */
export function getArticleModule(slug: string): ArticleModule | null {
    const articlePathMdx = `../../../articles/${slug}/${slug}.mdx`;
    const articlePathMd = `../../../articles/${slug}/${slug}.md`;

    const articleModule = (articles[articlePathMdx] || articles[articlePathMd]) as ArticleModule;

    return articleModule || null;
}

/**
 * Get complete article metadata with default values
 */
export function getArticleMetadata(slug: string): ArticleMetadata | null {
    const articleModule = getArticleModule(slug);

    if (!articleModule) {
        return null;
    }

    const completedFrontmatter = completeArticleFrontmatter(articleModule.frontmatter, slug);

    return {
        slug,
        title: completedFrontmatter.title,
        description: completedFrontmatter.description,
        lastUpdateDate: completedFrontmatter.createdAt,
        publishTo: completedFrontmatter.publishTo,
        createdAt: completedFrontmatter.createdAt,
    };
}

/**
 * Get all available articles with complete metadata
 */
export function getAllArticles(): ArticleMetadata[] {
    return Object.keys(articles)
        .filter((path) => {
            // Exclude README files and files directly in the articles folder
            const pathParts = path.split("/");
            const fileName = pathParts[pathParts.length - 1];
            const isReadme = fileName.toLowerCase().startsWith("readme");
            const isInSubdirectory = pathParts.length > 4; // ../../../articles/{slug}/{file}

            return !isReadme && isInSubdirectory;
        })
        .map((path) => {
            const slug = path.split("/").slice(-2, -1)[0]; // Extract slug from path
            return getArticleMetadata(slug);
        })
        .filter((metadata): metadata is ArticleMetadata => metadata !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by creation date, newest first
}