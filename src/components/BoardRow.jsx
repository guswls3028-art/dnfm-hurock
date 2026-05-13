import Link from "next/link";

/**
 * BoardRow — 자유 게시판 row.
 *
 * head=true 면 헤더 스타일.
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

  return (
    <Link href={`/board/${post.id}`} className="board-row" role="row">
      <span className="board-row-cat">{post.category}</span>
      <span className="board-row-title">
        {post.title}
        {post.comments ? ` [${post.comments}]` : ""}
      </span>
      <span className="board-row-meta">{post.author}</span>
      <span className="board-row-meta">{post.date}</span>
      <span className="board-row-meta">{post.views}</span>
    </Link>
  );
}
