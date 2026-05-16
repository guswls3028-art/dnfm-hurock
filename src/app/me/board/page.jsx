"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, apiFetch, comments as commentsApi } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

const TABS = [
  { value: "posts", label: "내 글" },
  { value: "comments", label: "내 댓글" },
];

function formatTime(iso) {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return t.toLocaleString("ko-KR", { hour12: false });
}

export default function MyBoardPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const tab = sp.get("tab") || "posts";
  const { user, loading: userLoading } = useCurrentUser();
  const isAuthed = Boolean(user);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    if (!isAuthed) return;
    setLoading(true);
    setErr(null);
    try {
      if (tab === "comments") {
        const res = await commentsApi.mine({ pageSize: 100 });
        setRows(Array.isArray(res?.items) ? res.items : []);
      } else {
        const res = await apiFetch("/sites/hurock/posts?author=me&pageSize=50&sort=recent");
        setRows(Array.isArray(res?.items) ? res.items : []);
      }
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "불러오기 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, isAuthed]);

  useEffect(() => {
    load();
  }, [load]);

  if (userLoading) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <div>
            <h1>로그인 확인 중…</h1>
            <p>내 활동을 불러오기 전에 로그인 상태를 확인하고 있습니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">확인중</StickerBadge>
        </div>
      </PageShell>
    );
  }

  if (!isAuthed) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <div>
            <h1>로그인이 필요해요</h1>
            <p>마이페이지는 회원 전용입니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/me/board")}`} className="btn btn-primary">
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>
            내 활동 <StickerBadge tone="cyan" rotate="l">MY</StickerBadge>
          </h1>
          <p>{user?.displayName || user?.username || "회원"} 님이 남긴 글·댓글</p>
        </div>
        <Link href="/board" className="btn">
          ← 게시판
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="내 활동" style={{ marginTop: 12 }}>
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/me/board?tab=${t.value}`}
            className={`tab${tab === t.value ? " is-active" : ""}`}
            role="tab"
            aria-selected={tab === t.value}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {err ? (
        <div className="callout-box is-pending" style={{ marginTop: 12 }}>
          <strong>불러오기 실패</strong>
          {err}
        </div>
      ) : null}

      <div className="grid" style={{ gap: 12, marginTop: 12 }}>
        {loading ? (
          <article className="card" style={{ padding: 14 }}>
            <p>불러오는 중…</p>
          </article>
        ) : rows.length === 0 ? (
          <article className="card" style={{ padding: 14 }}>
            <p>아직 {tab === "comments" ? "댓글" : "글"}이 없어요.</p>
            <Link href="/board/new" className="btn btn-primary btn-sm">
              글쓰기 →
            </Link>
          </article>
        ) : tab === "comments" ? (
          rows.map((c) => (
            <article
              key={c.id}
              className="card"
              style={{ padding: 14, flexDirection: "column", gap: 4 }}
            >
              <Link
                href={`/board/${encodeURIComponent(c.postId)}`}
                style={{ fontWeight: 700 }}
              >
                📄 {c.postTitle}
              </Link>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{c.body}</p>
              <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                {formatTime(c.createdAt)}
              </span>
            </article>
          ))
        ) : (
          rows.map((p) => (
            <article
              key={p.id}
              className="card"
              style={{
                padding: 14,
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <Link
                  href={`/board/${encodeURIComponent(p.id)}`}
                  style={{ fontWeight: 700 }}
                >
                  {p.title}
                </Link>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    color: "var(--muted)",
                    fontSize: "0.78rem",
                    marginTop: 4,
                  }}
                >
                  <span>{p.categoryName || p.categorySlug || "글"}</span>
                  <span>{formatTime(p.createdAt)}</span>
                  <span>조회 {p.viewCount ?? 0}</span>
                  <span>추천 {p.recommendCount ?? 0}</span>
                  <span>댓글 {p.commentCount ?? 0}</span>
                </div>
              </div>
              <Link
                href={`/board/${encodeURIComponent(p.id)}/edit`}
                className="btn btn-sm"
              >
                수정
              </Link>
            </article>
          ))
        )}
      </div>
    </PageShell>
  );
}
