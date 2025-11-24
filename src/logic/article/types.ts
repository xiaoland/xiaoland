export interface ArticleFrontmatter {
    title?: string;
    description?: string;
    publishTo?: string[];
    createdAt?: string;
}

export interface ArticleMetadata {
    slug: string;
    title: string;
    description?: string;
    lastUpdateDate?: string;
    publishTo: string[];
    createdAt: string;
}

export interface ArticleModule {
    default: any;
    frontmatter?: ArticleFrontmatter;
}