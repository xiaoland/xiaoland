import type { D1Database } from "@cloudflare/workers-types";

export type HonoContextT = {
  Bindings: { DB: D1Database };
  Variables: { 
    title?: string;
    description?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
};