import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { getLucia } from "./lib/auth";

import "./app.css";
import type { User, Session } from "lucia";

type LoaderData = {
  user: User | null;
  session: Session | null;
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const lucia = getLucia(context.cloudflare.env.DB);
  const sessionId = lucia.readSessionCookie(request.headers.get("Cookie") ?? "");
  if (!sessionId) {
    return { user: null, session: null };
  }
  const { user, session } = await lucia.validateSession(sessionId);
  return { user, session };
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData() as LoaderData;
  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <a href="/" className="font-bold">
            Home
          </a>
          <div>
            {user ? (
              <div className="flex items-center">
                <span>{user.username}</span>
                <form action="/api/logout" method="post">
                  <button type="submit" className="ml-4">
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <a href="/login" className="mr-4">
                  Login
                </a>
                <a href="/register">Register</a>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Outlet context={{ user }} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
