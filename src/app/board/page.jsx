"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import BoardRow from "@/components/BoardRow";
import Pagination from "@/components/Pagination";
import StickerBadge from "@/components/StickerBadge";
import { posts as postsApi } from "@/lib/api-client";

const PAGE_SIZE = 20;

const SORTS = [
  { value: "recent", label: "최신순" },
  { value: "best", label: "추천순" },
  { value: "views", label: "조회순" },
];

const ALL = "all";

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
  const params = useSearchParams();
  const activeCat = params.get("category") || ALL;
  const pageParam = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const sortParam = params.get("sort") || "recent";
  const qParam = params.get("q") || "";

  const [searchText, setSearchText] = useState(qParam);
  useEffect(() => setSearchText(qParam), [qParam]);

  const [categories, setCategories] = useState([{ slug: ALL, name: "전체" }]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await postsApi.categories();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (!alive || items.length === 0) return;
        setCategories([{ slug: ALL, name: "전체" }, ...items.map((c) => ({ slug: c.slug, name: c.name }))]);
      } catch {
        /* fallback - show ALL only */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [posts, setPosts] = useState(null);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let alive = true;
    setPosts(null);
    setLoadError(null);
    (async () => {
      try {
        const data = await postsApi.list({
          categorySlug: activeCat === ALL ? undefined : activeCat,
          q: qParam || undefined,
          sort: sortParam,
          page: pageParam,
          pageSize: PAGE_SIZE,
        });
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.posts || [];
        const t = typeof data?.total === "number" ? data.total : list.length;
        setPosts(list);
        setTotal(t);
      } catch (err) {
        if (!alive) return;
        setPosts([]);
        setTotal(0);
        setLoadError(err?.message || "네트워크 오류");
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeCat, pageParam, sortParam, qParam]);

  const visiblePosts = posts;

  function pushQuery(next) {
    const qs = new URLSearchParams();
    const cat = next.category ?? activeCat;
    const sort = next.sort ?? sortParam;
    const q = next.q ?? qParam;
    const page = next.page ?? 1;
    if (cat !== ALL) qs.set("category", cat);
    if (sort !== "recent") qs.set("sort", sort);
    if (q) qs.set("q", q);
    if (page > 1) qs.set("page", String(page));
    const s = qs.toString();
    router.push(s ? `/board?${s}` : "/board");
  }

  const buildPageHref = (n) => {
    const qs = new URLSearchParams();
    if (activeCat !== ALL) qs.set("category", activeCat);
    if (sortParam !== "recent") qs.set("sort", sortParam);
    if (qParam) qs.set("q", qParam);
    if (n > 1) qs.set("page", String(n));
    const s = qs.toString();
    return s ? `/board?${s}` : "/board";
  };

  function handleSearchSubmit(e) {
    e.preventDefault();
    pushQuery({ q: searchText.trim(), page: 1 });
  }

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>
            허락방 <StickerBadge tone="cyan" rotate="r">자유 게시판</StickerBadge>
          </h1>
          <p>잡담 / 공략 질문 / 콘테스트 후기 / 클립 공유. 비회원도 글 쓸 수 있어요.</p>
        </div>
        <Link href="/board/new" className="btn btn-primary">
          글쓰기
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="카테고리">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            className={`tab${cat.slug === activeCat ? " is-active" : ""}`}
            onClick={() => pushQuery({ category: cat.slug, page: 1 })}
            aria-selected={cat.slug === activeCat}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div
        className="board-toolbar"
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}
        >
          <input
            type="search"
            className="form-input"
            placeholder="제목·본문 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-sm">
            검색
          </button>
          {qParam ? (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => pushQuery({ q: "", page: 1 })}
            >
              지움
            </button>
          ) : null}
        </form>
        <div style={{ display: "flex", gap: 4 }} aria-label="정렬">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`btn btn-sm ${sortParam === s.value ? "btn-primary" : ""}`}
              onClick={() => pushQuery({ sort: s.value, page: 1 })}
              aria-pressed={sortParam === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <div className="callout-box" style={{ marginTop: 12 }}>
          <strong>잠시만요</strong>
          글 목록을 못 가져왔어요. 잠시 후 다시 시도해 주세요. ({loadError})
        </div>
      ) : null}

      <div
        className="board-list"
        role="table"
        aria-label="허락방 글 목록"
        style={{ marginTop: 12 }}
      >
        <BoardRow head />
        {visiblePosts === null ? (
          <div className="board-row">
            <span style={{ gridColumn: "1 / -1", color: "var(--muted)", padding: "12px" }}>
              불러오는 중…
            </span>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="board-empty">
            <p className="board-empty__msg">
              {qParam
                ? "검색 결과가 없어요."
                : activeCat === ALL
                  ? "허락방 첫 글의 주인공이 되어 주세요."
                  : "이 카테고리에 글이 아직 없어요."}
            </p>
            <Link href="/board/new" className="btn btn-primary">
              ✍️ 글쓰기
            </Link>
          </div>
        ) : (
          visiblePosts.map((p) => <BoardRow key={p.id} post={p} />)
        )}
      </div>

      <Pagination
        current={pageParam}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={buildPageHref}
      />
    </PageShell>
  );
}
