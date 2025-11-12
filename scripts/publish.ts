import { processArticles, Article } from './article-processor.js';
import { processImagesInArticle, uploadCoverImage } from './image-handler.js';
import { createDraft, updateDraft } from './wxoa-api.js';

async function main() {
  try {
    const { toAddArticles, toUpdateArticles } = await processArticles();

    const processArticle = async (article: Article) => {
      if (!article.coverImage) {
        throw new Error(`Article "${article.title}" is missing a coverImage.`);
      }
      const thumb_media_id = await uploadCoverImage(article.coverImage, article.filePath);
      const articleWithThumb = { ...article, thumb_media_id };
      return await processImagesInArticle(articleWithThumb);
    };

    for (const article of toAddArticles) {
      const processedArticle = await processArticle(article);
      await createDraft(processedArticle);
      console.log(`Successfully created draft for: ${article.title}`);
    }

    for (const article of toUpdateArticles) {
      const processedArticle = await processArticle(article);
      await updateDraft(article.media_id, processedArticle);
      console.log(`Successfully updated draft for: ${article.title}`);
    }

    console.log('All articles have been processed.');
  } catch (error) {
    console.error('An error occurred during the publishing process:', error);
    process.exit(1);
  }
}

main();
