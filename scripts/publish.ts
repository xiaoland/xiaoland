import { processArticles, Article } from './article-processor.js';
import { processImagesInArticle, uploadCoverImage } from './image-handler.js';
import { createDraft, updateDraft, WxoaArticle } from './wxoa-api.js';

async function main() {
  try {
    const { toAddArticles, toUpdateArticles } = await processArticles();

    const processArticle = async (article: Article) => {
      if (!article.coverImage) {
        throw new Error(`Article "${article.title}" is missing a coverImage.`);
      }
      const thumb_media_id = await uploadCoverImage(article.coverImage, article.filePath);
      const articleWithThumb = {
        ...article,
        thumb_media_id,
        image_info: {
          image_list: [
            {
              image_media_id: thumb_media_id,
            },
          ],
        },
      };
      return await processImagesInArticle(articleWithThumb);
    };

    for (const article of toAddArticles) {
      try {
        const processedArticle = await processArticle(article);
        await createDraft(processedArticle as unknown as WxoaArticle);
        console.log(`Successfully created draft for: ${article.title}`);
      } catch (error) {
        console.error(`Failed to create draft for "${article.title}":`, error);
      }
    }

    for (const article of toUpdateArticles) {
      try {
        const processedArticle = await processArticle(article);
        await updateDraft(article.media_id, processedArticle as unknown as WxoaArticle);
        console.log(`Successfully updated draft for: ${article.title}`);
      } catch (error) {
        console.error(`Failed to update draft for "${article.title}":`, error);
      }
    }

    console.log('All articles have been processed.');
  } catch (error) {
    console.error('An error occurred during the publishing process:', error);
    process.exit(1);
  }
}

main();
