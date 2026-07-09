import { Hono } from "hono";
import { AppEnv } from "./env";

const commentApp = new Hono<AppEnv>();

commentApp.post("", async (c) => {});

export default commentApp;
