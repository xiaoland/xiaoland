/** @jsxImportSource react */
import { useState, useEffect } from "react";
import styles from "./ArticleComments.module.scss";

interface Comment {
  id: number;
  articleSlug: string;
  author: string;
  content: string;
  createdAt: string;
}

interface ArticleCommentsProps {
  slug: string;
}

export function ArticleComments({ slug }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments/${slug}`);
      const data = (await response.json()) as Comment[];
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!author.trim() || !content.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleSlug: slug,
          author: author.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const newComment = (await response.json()) as Comment;
      setComments([newComment, ...comments]);
      setAuthor("");
      setContent("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.articleComments}>
      <span className={styles.sectionTitle}>发表评论</span>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="author">昵称</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="你的名字"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法..."
            rows={4}
            disabled={isSubmitting}
            required
          />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "提交中..." : "发表"}
        </button>
      </form>

      {/* Comments List */}
      <div className={styles.commentsList}>
        <span className={styles.listHeader}>
          {comments.length > 0 ? `${comments.length} 条评论` : "评论"}
        </span>

        {isLoading ? (
          <span className={styles.loadingText}>加载中...</span>
        ) : comments.length === 0 ? (
          <span className={styles.noComments}>还没有评论，来说点什么吧</span>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.author}</span>
                <span className={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <span className={styles.commentContent}>{comment.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
