import { type ActionFunctionArgs } from 'react-router';
import { getLucia } from '~/lib/auth';
import { users } from '@drizzle/schema';
import { json } from '~/lib/json';
import { hash } from 'bcryptjs';
import { generateId } from 'lucia';
import { getDb } from '~/lib/db';

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const lucia = getLucia(context.cloudflare.env.DB);
  const db = getDb(context.cloudflare.env.DB);
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
    return json({ error: 'Invalid username' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
    return json({ error: 'Invalid password' }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);
  const userId = generateId(15);

  try {
    await db.insert(users).values({
      id: userId,
      username: username,
      password: hashedPassword,
    });
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': sessionCookie.serialize(),
      },
    });
  } catch (e) {
    return json({ error: 'Username already taken' }, { status: 400 });
  }
};
