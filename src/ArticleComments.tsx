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
      <h2>评论</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="author">名字</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="请输入您的名字"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">评论内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入评论内容"
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
          {isSubmitting ? "提交中..." : "发表评论"}
        </button>
      </form>

      {/* Comments List */}
      <div className={styles.commentsList}>
        <h3>全部评论 ({comments.length})</h3>

        {isLoading ? (
          <p>加载中...</p>
        ) : comments.length === 0 ? (
          <p className={styles.noComments}>暂无评论，快来发表第一条评论吧！</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.author}</span>
                <span className={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <div className={styles.commentContent}>{comment.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
