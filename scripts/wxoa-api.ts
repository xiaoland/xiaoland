import axios from 'axios';

const { APP_ID, APP_SECRET } = process.env;

if (!APP_ID || !APP_SECRET) {
  throw new Error('Missing APP_ID or APP_SECRET environment variables');
}

const API_BASE = 'https://api.weixin.qq.com/cgi-bin';

interface AccessToken {
  access_token: string;
  expires_in: number;
}

let accessToken: AccessToken | null = null;
let tokenExpiresAt = 0;

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken.access_token;
  }

  const { data } = await axios.get(`${API_BASE}/token`, {
    params: {
      grant_type: 'client_credential',
      appid: APP_ID,
      secret: APP_SECRET,
    },
  });

  if (data.errcode) {
    throw new Error(`Failed to get access token: ${data.errmsg}`);
  }

  accessToken = data;
  tokenExpiresAt = Date.now() + (accessToken!.expires_in - 120) * 1000; // 2-minute buffer

  return accessToken!.access_token;
}

export interface Draft {
  media_id: string;
  content: {
    news_item: {
      content_source_url: string;
    }[];
  };
}

export async function getDrafts(): Promise<Draft[]> {
  const token = await getAccessToken();
  const allDrafts: Draft[] = [];
  let offset = 0;
  const count = 20;

  while (true) {
    const { data } = await axios.post(
      `${API_BASE}/draft/batchget?access_token=${token}`,
      {
        offset,
        count,
        no_content: 1,
      }
    );

    if (data.errcode) {
      throw new Error(`Failed to get drafts: ${data.errmsg}`);
    }

    if (data.item && data.item.length > 0) {
      allDrafts.push(...data.item);
    }

    if (allDrafts.length >= data.total_count || data.item_count < count) {
      break;
    }

    offset += data.item_count;
  }

  return allDrafts;
}

export async function createDraft(article: any): Promise<void> {
  const token = await getAccessToken();
  const { title, content, content_source_url, thumb_media_id } = article;
  const payload = {
    title,
    content,
    content_source_url,
    thumb_media_id,
  };

  const { data } = await axios.post(
    `${API_BASE}/draft/add?access_token=${token}`,
    {
      articles: [payload],
    }
  );

  if (data.errcode) {
    throw new Error(`Failed to create draft: ${data.errmsg}`);
  }
}

export async function updateDraft(mediaId: string, article: any): Promise<void> {
  const token = await getAccessToken();
  const { title, content, content_source_url, thumb_media_id } = article;
  const payload = {
    title,
    content,
    content_source_url,
    thumb_media_id,
  };
  const { data } = await axios.post(
    `${API_BASE}/draft/update?access_token=${token}`,
    {
      media_id: mediaId,
      index: 0,
      articles: payload,
    }
  );

  if (data.errcode) {
    throw new Error(`Failed to update draft: ${data.errmsg}`);
  }
}

export async function uploadContentImage(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const token = await getAccessToken();
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('media', imageBuffer, { filename: fileName });

  const { data } = await axios.post(
    `${API_BASE}/media/uploadimg?access_token=${token}`,
    form,
    {
      headers: form.getHeaders(),
    }
  );

  if (data.errcode) {
    throw new Error(`Failed to upload content image: ${data.errmsg}`);
  }

  return data.url;
}

export async function uploadThumbImage(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const token = await getAccessToken();
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('media', imageBuffer, { filename: fileName });

  const { data } = await axios.post(
    `${API_BASE}/material/add_material?access_token=${token}&type=thumb`,
    form,
    {
      headers: form.getHeaders(),
    }
  );

  if (data.errcode) {
    throw new Error(`Failed to upload thumb image: ${data.errmsg}`);
  }

  return data.media_id;
}
