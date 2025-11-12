import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import { uploadContentImage, uploadThumbImage } from './wxoa-api.js';
import { Article } from './article-processor.js';

async function getImageBuffer(imageUrl: string, articleFilePath: string): Promise<Buffer | null> {
  try {
    if (imageUrl.startsWith('http')) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } else {
      const imagePath = path.resolve(path.dirname(articleFilePath), imageUrl);
      return await fs.readFile(imagePath);
    }
  } catch (error) {
    console.error(`Failed to get image buffer for ${imageUrl}:`, error);
    return null;
  }
}

export async function processImagesInArticle(article: Article): Promise<Article> {
  const imageRegex = /<img src="([^"]+)"/g;
  let newContent = article.content;
  let match;

  while ((match = imageRegex.exec(article.content)) !== null) {
    const originalUrl = match[1];
    const imageBuffer = await getImageBuffer(originalUrl, article.filePath);

    if (imageBuffer) {
      try {
        const fileName = path.basename(originalUrl);
        const newUrl = await uploadContentImage(imageBuffer, fileName);
        newContent = newContent.replace(originalUrl, newUrl);
      } catch (error) {
        console.error(`Failed to upload image ${originalUrl}:`, error);
      }
    }
  }

  return { ...article, content: newContent };
}

export async function uploadCoverImage(
  coverImageUrl: string,
  articleFilePath: string
): Promise<string> {
  const imageBuffer = await getImageBuffer(coverImageUrl, articleFilePath);
  if (!imageBuffer) {
    throw new Error(`Could not get buffer for cover image: ${coverImageUrl}`);
  }
  const fileName = path.basename(coverImageUrl);
  return await uploadThumbImage(imageBuffer, fileName);
}
