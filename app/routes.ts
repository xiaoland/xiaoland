import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("article/:slug", "routes/article.$slug.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("api/login", "routes/api.login.tsx"),
  route("api/register", "routes/api.register.tsx"),
  route("api/logout", "routes/api.logout.tsx"),
  route("api/articles/:slug/comments", "routes/api.articles.$slug.comments.tsx"),
] satisfies RouteConfig;
