"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import BoardRow from "@/components/BoardRow";
import StickerBadge from "@/components/StickerBadge";
import { boardCategories, boardPosts as mockPosts } from "@/lib/content";
import { posts as postsApi } from "@/lib/api-client";

export default function BoardPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [usingMock, setUsingMock] = useState(true);
  const [activeCat, setActiveCat] = useState(boardCategories[0]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const category = activeCat === "전체" ? undefined : activeCat;
        const data = await postsApi.list({ category });
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.posts || [];
        if (list.length) {
          setPosts(list);
          setUsingMock(false);
        } else if (!usingMock) {
          setPosts([]);
        }
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat]);

  const visiblePosts = usingMock
    ? activeCat === "전체"
      ? posts
      : posts.filter((p) => p.category === activeCat)
    : posts;

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
        {boardCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`tab${cat === activeCat ? " is-active" : ""}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {usingMock && (
        <div className="callout-box" style={{ marginTop: 8 }}>
          <strong>안내</strong>
          백엔드 미가용 — 샘플 글 표시 중. 글쓰기는 백엔드 연결 후 동작.
        </div>
      )}

      <div className="board-list" role="table" aria-label="허락방 글 목록" style={{ marginTop: 12 }}>
        <BoardRow head />
        {visiblePosts.length === 0 ? (
          <div className="board-row">
            <span style={{ gridColumn: "1 / -1", color: "var(--muted)", padding: "12px" }}>
              이 카테고리에 글이 없습니다.
            </span>
          </div>
        ) : (
          visiblePosts.map((p) => <BoardRow key={p.id} post={p} />)
        )}
      </div>
    </PageShell>
  );
}
