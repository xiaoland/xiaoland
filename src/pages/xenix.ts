import { xenixPage } from "../templates/xenix";

export function renderXenixPage({
  apiOrigin,
}: {
  apiOrigin?: string;
}): string {
  return xenixPage({ apiOrigin });
}
