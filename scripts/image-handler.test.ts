import { describe, it, expect, vi, type MockedFunction } from 'vitest';
import { processImagesInArticle, uploadCoverImage } from './image-handler.js';
import fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';
import * as wxoaApi from './wxoa-api.js';
import { Article } from './article-processor.js';

vi.mock('fs/promises');
vi.mock('axios');
vi.mock('./wxoa-api.js', () => ({
  uploadContentImage: vi.fn(),
  uploadThumbImage: vi.fn(),
}));

const mockedUploadContentImage = wxoaApi.uploadContentImage as MockedFunction<typeof wxoaApi.uploadContentImage>;
const mockedUploadThumbImage = wxoaApi.uploadThumbImage as MockedFunction<typeof wxoaApi.uploadThumbImage>;
const mockedAxiosGet = axios.get as MockedFunction<typeof axios.get>;

describe('image-handler', () => {
  const mockArticle: Article = {
    slug: 'test-article',
    title: 'Test Article',
    content: '<img src="./test-image.jpg">',
    content_source_url: 'https://example.com/article/test-article',
    filePath: '/path/to/articles/test-article/index.mdx',
    coverImage: './cover-image.jpg',
  };

  it('should process images in article content', async () => {
    const mockImageBuffer = Buffer.from('mock image data');
    vi.spyOn(fs, 'readFile').mockResolvedValue(mockImageBuffer);
    mockedUploadContentImage.mockResolvedValue('mock_new_image_url');

    const processedArticle = await processImagesInArticle(mockArticle);

    expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
    expect(mockedUploadContentImage).toHaveBeenCalledWith(mockImageBuffer, 'test-image.jpg');
    expect(processedArticle.content).toBe('<img src="mock_new_image_url">');
  });

  it('should upload cover image', async () => {
    const mockImageBuffer = Buffer.from('mock image data');
    vi.spyOn(fs, 'readFile').mockResolvedValue(mockImageBuffer);
    mockedUploadThumbImage.mockResolvedValue('mock_thumb_media_id');

    const thumbMediaId = await uploadCoverImage(mockArticle.coverImage!, mockArticle.filePath);

    expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('cover-image.jpg'));
    expect(mockedUploadThumbImage).toHaveBeenCalledWith(mockImageBuffer, 'cover-image.jpg');
    expect(thumbMediaId).toBe('mock_thumb_media_id');
  });

  it('should handle remote images', async () => {
    const mockArticleWithRemoteImage: Article = {
      ...mockArticle,
      content: '<img src="https://example.com/remote-image.jpg">',
    };
    const mockImageBuffer = Buffer.from('mock remote image data');
    mockedAxiosGet.mockResolvedValue({ data: mockImageBuffer } as AxiosResponse<Buffer>);
    mockedUploadContentImage.mockResolvedValue('mock_new_remote_image_url');

    const processedArticle = await processImagesInArticle(mockArticleWithRemoteImage);

    expect(mockedAxiosGet).toHaveBeenCalledWith('https://example.com/remote-image.jpg', { responseType: 'arraybuffer' });
    expect(mockedUploadContentImage).toHaveBeenCalledWith(mockImageBuffer, 'remote-image.jpg');
    expect(processedArticle.content).toBe('<img src="mock_new_remote_image_url">');
  });
});
