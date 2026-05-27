import { DB } from "../db";

export function getComments(articleId: string, db: DB) {
  return db.query.comments.findMany({
    where: (comments, { eq }) => eq(comments.articleId, articleId),
  });
}
