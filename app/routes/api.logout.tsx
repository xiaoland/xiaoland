import { type ActionFunctionArgs, redirect } from 'react-router';
import { getLucia } from '~/lib/auth';

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const lucia = getLucia(context.cloudflare.env.DB);
  const sessionId = lucia.readSessionCookie(request.headers.get('Cookie') ?? '');
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  const sessionCookie = lucia.createBlankSessionCookie();
  return redirect('/', {
    headers: {
      'Set-Cookie': sessionCookie.serialize(),
    },
  });
};
