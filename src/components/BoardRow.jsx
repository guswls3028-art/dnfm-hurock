import Link from "next/link";
import { formatAuthor, isAnonymousEntry } from "@/lib/anonymous";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

/**
 * BoardRow — 자유 게시판 row.
 *
 * head=true 면 헤더 스타일.
 * post: backend shape (authorId / authorNickname / anonymousMarker).
 */
export default function BoardRow({ post, head }) {
  if (head) {
    return (
      <div className="board-row is-head" role="row">
        <span>카테고리</span>
        <span>제목</span>
        <span>작성자</span>
        <span>날짜</span>
        <span>조회</span>
      </div>
    );
  }

  // 이전 포맷으로 들어온 author 필드도 운영 데이터 호환 차원에서 표시.
  const hasAuthorShape = "authorId" in post || "authorNickname" in post || "anonymousMarker" in post;
  const author = hasAuthorShape ? formatAuthor(post, post.authorDisplayName) : post.author;
  const guest = hasAuthorShape && isAnonymousEntry(post);
  const category = post.category || post.categoryName || post.categoryLabel || post.categorySlug || "글";
  const title = post.title || "(제목 없음)";
  const comments =
    typeof post.comments === "number"
      ? post.comments
      : (post.commentCount ?? post.commentsCount ?? 0);
  const date = post.date || formatDate(post.createdAt || post.time);
  const views = typeof post.views === "number" ? post.views : (post.viewCount ?? 0);

  return (
    <Link href={`/board/${post.id}`} className="board-row" role="row">
      <span className="board-row-cat">{category}</span>
      <span className="board-row-title">
        {title}
        {comments ? <span className="board-row-comments">[{comments}]</span> : null}
      </span>
      <span className={`board-row-meta${guest ? " board-row-meta--guest" : ""}`}>
        {author}
      </span>
      <span className="board-row-meta">{date}</span>
      <span className="board-row-meta">{views}</span>
    </Link>
  );
}
