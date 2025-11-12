import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as articleProcessor from './article-processor.js';
import * as imageHandler from './image-handler.js';
import * as wxoaApi from './wxoa-api.js';

vi.mock('./article-processor.js', () => ({
  processArticles: vi.fn(),
}));
vi.mock('./image-handler.js', () => ({
  processImagesInArticle: vi.fn(),
  uploadCoverImage: vi.fn(),
}));
vi.mock('./wxoa-api.js', () => ({
  createDraft: vi.fn(),
  updateDraft: vi.fn(),
}));

describe('publish script', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const mockToAddArticle = {
    title: 'New Article',
    coverImage: 'cover.jpg',
    filePath: '/path/to/new-article/index.mdx',
  };
  const mockToUpdateArticle = {
    title: 'Updated Article',
    coverImage: 'cover.jpg',
    filePath: '/path/to/updated-article/index.mdx',
    media_id: 'existing_media_id',
  };

  it('should process and create drafts for new articles', async () => {
    (articleProcessor.processArticles).mockResolvedValue({
      toAddArticles: [mockToAddArticle],
      toUpdateArticles: [],
    });
    (imageHandler.uploadCoverImage).mockResolvedValue('new_thumb_id');
    (imageHandler.processImagesInArticle).mockResolvedValue({ ...mockToAddArticle, thumb_media_id: 'new_thumb_id' });

    await import('./publish.js');

    expect(articleProcessor.processArticles).toHaveBeenCalled();
    expect(imageHandler.uploadCoverImage).toHaveBeenCalledWith('cover.jpg', mockToAddArticle.filePath);
    expect(imageHandler.processImagesInArticle).toHaveBeenCalled();
    expect(wxoaApi.createDraft).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Article' }));
  });

  it('should process and update drafts for existing articles', async () => {
    (articleProcessor.processArticles).mockResolvedValue({
      toAddArticles: [],
      toUpdateArticles: [mockToUpdateArticle],
    });
    (imageHandler.uploadCoverImage).mockResolvedValue('updated_thumb_id');
    (imageHandler.processImagesInArticle).mockResolvedValue({ ...mockToUpdateArticle, thumb_media_id: 'updated_thumb_id' });

    await import('./publish.js');

    expect(articleProcessor.processArticles).toHaveBeenCalled();
    expect(imageHandler.uploadCoverImage).toHaveBeenCalledWith('cover.jpg', mockToUpdateArticle.filePath);
    expect(imageHandler.processImagesInArticle).toHaveBeenCalled();
    expect(wxoaApi.updateDraft).toHaveBeenCalledWith('existing_media_id', expect.objectContaining({ title: 'Updated Article' }));
  });
});
