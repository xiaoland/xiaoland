import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("article/:slug", "routes/article.$slug.tsx"),
] satisfies RouteConfig;
