import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import * as wxoaApi from './wxoa-api.js';

vi.mock('fs/promises');

// Mock the wxoa-api module
vi.mock('./wxoa-api.js', () => ({
  getDrafts: vi.fn(),
}));

describe('processArticles', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should process articles and categorize them into toAdd and toUpdate', async () => {
    process.env.SITE_URL = 'https://example.com';
    const { processArticles } = await import('./article-processor.js');

    // Mock readdir to return our mock articles
    vi.spyOn(fs, 'readdir')
      .mockResolvedValueOnce([
        { name: 'article-1', isDirectory: () => true, isFile: () => false },
        { name: 'article-2', isDirectory: () => true, isFile: () => false },
      ])
      .mockResolvedValueOnce([{ name: 'index.mdx', isFile: () => true, isDirectory: () => false }])
      .mockResolvedValueOnce([{ name: 'index.mdx', isFile: () => true, isDirectory: () => false }]);

    // Mock readFile for each article
    const article1Content = `---
title: 'Test Article 1'
publishTo: ['wxoa']
coverImage: './cover.jpg'
---
This is the content of test article 1.`;
    const article2Content = `---
title: 'Test Article 2'
publishTo: ['wxoa']
coverImage: './cover.jpg'
---
This is the content of test article 2.`;

    vi.spyOn(fs, 'readFile')
      .mockResolvedValueOnce(article1Content)
      .mockResolvedValueOnce(article2Content);

    // Mock getDrafts to simulate one existing draft
    (wxoaApi.getDrafts).mockResolvedValue([
      {
        media_id: 'mock_media_id_2',
        content: {
          news_item: [{ content_source_url: 'https://example.com/article/article-2' }],
        },
      },
    ]);

    const { toAddArticles, toUpdateArticles } = await processArticles();

    expect(toAddArticles).toHaveLength(1);
    expect(toAddArticles[0].title).toBe('Test Article 1');
    expect(toUpdateArticles).toHaveLength(1);
    expect(toUpdateArticles[0].title).toBe('Test Article 2');
    expect(toUpdateArticles[0].media_id).toBe('mock_media_id_2');
  });
});
