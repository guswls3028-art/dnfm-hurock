import Link from "next/link";
import { formatAuthor, isAnonymousEntry } from "@/lib/anonymous";

/**
 * BoardRow — 자유 게시판 row.
 *
 * head=true 면 헤더 스타일.
 * post: backend shape (authorId / authorNickname / anonymousMarker) 또는 mock (author).
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

  // backend shape (authorId 등) 가 있으면 fmt util, 없으면 mock 의 post.author 그대로.
  const hasAuthorShape = "authorId" in post || "authorNickname" in post || "anonymousMarker" in post;
  const author = hasAuthorShape ? formatAuthor(post, post.authorDisplayName) : post.author;
  const guest = hasAuthorShape && isAnonymousEntry(post);

  return (
    <Link href={`/board/${post.id}`} className="board-row" role="row">
      <span className="board-row-cat">{post.category}</span>
      <span className="board-row-title">
        {post.title}
        {post.comments ? ` [${post.comments}]` : ""}
      </span>
      <span className={`board-row-meta${guest ? " board-row-meta--guest" : ""}`}>
        {author}
      </span>
      <span className="board-row-meta">{post.date}</span>
      <span className="board-row-meta">{post.views}</span>
    </Link>
  );
}
