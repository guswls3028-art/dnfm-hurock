import Link from "next/link";
import PageShell from "@/components/PageShell";
import BoardRow from "@/components/BoardRow";
import StickerBadge from "@/components/StickerBadge";
import { boardCategories, boardPosts } from "@/lib/content";

export const metadata = { title: "허락방" };

export default function BoardPage() {
  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>
            허락방 <StickerBadge tone="cyan" rotate="r">자유 게시판</StickerBadge>
          </h1>
          <p>시청자들의 잡담 / 공략 질문 / 콘테스트 후기 / 클립 공유.</p>
        </div>
        <Link href="/board/new" className="btn btn-primary">
          글쓰기
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="카테고리">
        {boardCategories.map((cat, i) => (
          <button key={cat} type="button" className={`tab${i === 0 ? " is-active" : ""}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="board-list" role="table" aria-label="허락방 글 목록">
        <BoardRow head />
        {boardPosts.map((p) => (
          <BoardRow key={p.id} post={p} />
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6 }}>
        {["<", 1, 2, 3, 4, ">"].map((p, i) => (
          <button key={i} type="button" className={`btn btn-sm${p === 1 ? " btn-accent" : ""}`}>
            {p}
          </button>
        ))}
      </div>
    </PageShell>
  );
}
