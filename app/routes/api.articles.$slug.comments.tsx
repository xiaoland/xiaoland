import { type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { getLucia } from '~/lib/auth';
import { comments, users } from '@drizzle/schema';
import { json } from '~/lib/json';
import { getDb } from '~/lib/db';
import { and, eq } from 'drizzle-orm';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const db = getDb(context.cloudflare.env.DB);
  const articleSlug = params.slug;
  if (!articleSlug) {
    return json({ error: 'Article slug is required' }, { status: 400 });
  }

  const articleComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      author: users.username,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.articleSlug, articleSlug))
    .orderBy(comments.createdAt);

  return json(articleComments);
};

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  const lucia = getLucia(context.cloudflare.env.DB);
  const db = getDb(context.cloudflare.env.DB);
  const articleSlug = params.slug;
  if (!articleSlug) {
    return json({ error: 'Article slug is required' }, { status: 400 });
  }

  const sessionId = lucia.readSessionCookie(request.headers.get('Cookie') ?? '');
  if (!sessionId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content');

  if (typeof content !== 'string' || content.length === 0) {
    return json({ error: 'Comment content cannot be empty' }, { status: 400 });
  }

  await db.insert(comments).values({
    articleSlug: articleSlug,
    authorId: user.id,
    content: content,
  });

  return json({ success: true });
};
