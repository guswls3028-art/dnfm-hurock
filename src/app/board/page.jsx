"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import BoardRow from "@/components/BoardRow";
import Pagination from "@/components/Pagination";
import StickerBadge from "@/components/StickerBadge";
import { boardCategories, boardPosts as mockPosts } from "@/lib/content";
import { posts as postsApi } from "@/lib/api-client";

const PAGE_SIZE = 20;

export default function BoardPage() {
  return (
    <Suspense fallback={<BoardLoading />}>
      <BoardInner />
    </Suspense>
  );
}

function BoardLoading() {
  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>허락방</h1>
          <p>불러오는 중…</p>
        </div>
      </div>
    </PageShell>
  );
}

function BoardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("category") || boardCategories[0];
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [posts, setPosts] = useState(mockPosts);
  const [total, setTotal] = useState(0);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const category = activeCat === "전체" ? undefined : activeCat;
        const data = await postsApi.list({ category, page: pageParam });
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.posts || [];
        const t =
          typeof data?.total === "number"
            ? data.total
            : Array.isArray(list)
              ? list.length
              : 0;
        if (list.length) {
          setPosts(list);
          setTotal(t);
          setUsingMock(false);
        } else if (!usingMock) {
          setPosts([]);
          setTotal(0);
        }
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, pageParam]);

  const visiblePosts = useMemo(() => {
    if (!usingMock) return posts;
    return activeCat === "전체" ? posts : posts.filter((p) => p.category === activeCat);
  }, [posts, usingMock, activeCat]);

  function setActiveCat(cat) {
    const qs = new URLSearchParams();
    if (cat && cat !== boardCategories[0]) qs.set("category", cat);
    const s = qs.toString();
    router.push(s ? `/board?${s}` : "/board");
  }

  const buildPageHref = (n) => {
    const qs = new URLSearchParams();
    if (activeCat && activeCat !== boardCategories[0]) qs.set("category", activeCat);
    if (n > 1) qs.set("page", String(n));
    const s = qs.toString();
    return s ? `/board?${s}` : "/board";
  };

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

      {!usingMock && (
        <Pagination
          current={pageParam}
          total={total}
          pageSize={PAGE_SIZE}
          buildHref={buildPageHref}
        />
      )}
    </PageShell>
  );
}
