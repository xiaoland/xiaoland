import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
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

const mockedProcessArticles = articleProcessor.processArticles as MockedFunction<typeof articleProcessor.processArticles>;
const mockedUploadCoverImage = imageHandler.uploadCoverImage as MockedFunction<typeof imageHandler.uploadCoverImage>;
const mockedProcessImagesInArticle = imageHandler.processImagesInArticle as MockedFunction<typeof imageHandler.processImagesInArticle>;
const mockedCreateDraft = wxoaApi.createDraft as MockedFunction<typeof wxoaApi.createDraft>;
const mockedUpdateDraft = wxoaApi.updateDraft as MockedFunction<typeof wxoaApi.updateDraft>;

describe('publish script', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const mockToAddArticle = {
    slug: 'new-article',
    title: 'New Article',
    content: 'Article content',
    content_source_url: 'https://example.com/article/new-article',
    coverImage: 'cover.jpg',
    filePath: '/path/to/new-article/index.mdx',
  };
  const mockToUpdateArticle = {
    slug: 'updated-article',
    title: 'Updated Article',
    content: 'Article content',
    content_source_url: 'https://example.com/article/updated-article',
    coverImage: 'cover.jpg',
    filePath: '/path/to/updated-article/index.mdx',
    media_id: 'existing_media_id',
  };

  it('should process and create drafts for new articles', async () => {
    mockedProcessArticles.mockResolvedValue({
      toAddArticles: [mockToAddArticle],
      toUpdateArticles: [],
    });
    mockedUploadCoverImage.mockResolvedValue('new_thumb_id');
    mockedProcessImagesInArticle.mockResolvedValue({ ...mockToAddArticle, thumb_media_id: 'new_thumb_id' });

    await import('./publish.js');

    expect(mockedProcessArticles).toHaveBeenCalled();
    expect(mockedUploadCoverImage).toHaveBeenCalledWith('cover.jpg', mockToAddArticle.filePath);
    expect(mockedProcessImagesInArticle).toHaveBeenCalled();
    expect(mockedCreateDraft).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Article' }));
  });

  it('should process and update drafts for existing articles', async () => {
    mockedProcessArticles.mockResolvedValue({
      toAddArticles: [],
      toUpdateArticles: [mockToUpdateArticle],
    });
    mockedUploadCoverImage.mockResolvedValue('updated_thumb_id');
    mockedProcessImagesInArticle.mockResolvedValue({ ...mockToUpdateArticle, thumb_media_id: 'updated_thumb_id' });

    await import('./publish.js');

    expect(mockedProcessArticles).toHaveBeenCalled();
    expect(mockedUploadCoverImage).toHaveBeenCalledWith('cover.jpg', mockToUpdateArticle.filePath);
    expect(mockedProcessImagesInArticle).toHaveBeenCalled();
    expect(mockedUpdateDraft).toHaveBeenCalledWith('existing_media_id', expect.objectContaining({ title: 'Updated Article' }));
  });
});
