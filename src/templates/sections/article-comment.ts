import { escapeAttribute, escapeHtml } from "../../site/html";

export interface ArticleCommentComponentProps {
  sentByAvatar: string;
  sentByNickname: string;
  commentContent: string;
  commentCreatedAt: string;
}

export function articleComment({
  sentByAvatar,
  sentByNickname,
  commentContent,
  commentCreatedAt,
}: ArticleCommentComponentProps): string {
  const avatar = sentByAvatar
    ? `<img class="sent-by-avatar" src="${escapeAttribute(sentByAvatar)}" alt="Avatar" />`
    : "";

  return `<article class="article-comment">
    <header>
      ${avatar}
      <span itemprop="name" class="sent-by-nickname">${escapeHtml(sentByNickname)}</span>
      <time itemprop="datePublished" class="comment-created-at" datetime="${escapeAttribute(commentCreatedAt)}">${escapeHtml(commentCreatedAt)}</time>
    </header>
    <p>
      ${escapeHtml(commentContent)}
    </p>
  </article>`;
}
