# AGENTS.md

This document provides a guide for AI agents working on this project.

## Architecture Overview

This is a full-stack application built with [React](https://react.dev/) and [Vite](https://vitejs.dev/), deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

- **Frontend:** The frontend is a React application using [Tailwind CSS](https://tailwindcss.com/) for styling. Routing is handled by [React Router](https://reactrouter.com/).
- **Backend:** The backend is running on Cloudflare Workers.
- **Database:** The application uses [Cloudflare D1](https://developers.cloudflare.com/d1/) as the database, with [Drizzle ORM](https://orm.drizzle.team/) for database access.
- **Authentication:** User authentication is implemented using the [Lucia](https://lucia-auth.com/) library with a Drizzle adapter.
- **Content:** Article content is written in [MDX](https://mdxjs.com/) and stored in the `articles/` directory. The project uses `rehype-mdx-import-media` to handle relative image paths in MDX files.

## Core Commands

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
- `npx wrangler d1 migrations apply site --local`: Applies local database migrations.
- `npx drizzle-kit generate`: Generates database migrations.

## Project Layout

- `app/`: Contains the main application code, including React components, routes, and server-side logic.
- `articles/`: Contains the MDX files for the articles.
- `drizzle/`: Contains the Drizzle ORM configuration and schema.
- `public/`: Contains static assets that are served directly.
- `workers/`: Contains the Cloudflare Worker code.
- `vite.config.ts`: The Vite configuration file.
- `wrangler.jsonc`: The Cloudflare Wrangler configuration file.
- `tsconfig.cloudflare.json`: Defines path aliases, including `~/*` for `./app/*` and `@drizzle/*` for `./drizzle/*`.

## Development Patterns & Constraints

- **Styling:** Use Tailwind CSS for all styling.
- **Database:** Use Drizzle ORM for all database interactions. Migrations are generated with `drizzle-kit`.
- **Routing:** Use React Router for all routing.
- **Content:** Use MDX for all article content.
- **State Management:** (Not specified, but a good place to add if a library is used)
