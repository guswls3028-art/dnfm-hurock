"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { posts as postsApi, ApiError } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const PAGE_SIZE = 30;

export default function AdminBoardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(null);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const res = await postsApi.list({ page: 1, pageSize: PAGE_SIZE, sort: "recent" });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "목록 불러오기 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userLoading && user && isAdmin(user)) {
      reload();
    }
  }, [userLoading, user]);

  async function onDelete(post) {
    if (!post?.id) return;
    const ok = window.confirm(`정말 삭제할까요?\n\n[${post.title}]\n\n복구는 어렵습니다.`);
    if (!ok) return;
    setBusy(post.id);
    try {
      await postsApi.remove(post.id);
      await reload();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "삭제 실패");
    } finally {
      setBusy(null);
    }
  }

  if (userLoading) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>권한 확인 중…</h1>
            <p>운영자 권한을 확인하고 있습니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">확인중</StickerBadge>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>게시판 관리는 운영자(허락님 본인) 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/admin/board")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  if (user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>접근 권한이 없습니다</h1>
            <p>운영자(role=admin) 전용입니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">403</StickerBadge>
        </div>
        <Link href="/" className="btn">홈으로</Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            게시판 관리 <StickerBadge tone="cyan" rotate="r">운영자 전용</StickerBadge>
          </h1>
          <p>최근 글 {rows.length}개 — 부적절한 글은 즉시 삭제할 수 있어요. 삭제는 복구 어려움.</p>
        </div>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <button type="button" className="btn btn-sm" onClick={reload} disabled={loading}>
            {loading ? "불러오는 중…" : "새로고침"}
          </button>
          <Link href="/admin" className="btn btn-sm">← 어드민 홈</Link>
        </div>
      </div>

      {err && (
        <div className="callout-box is-pending" style={{ marginBottom: 12 }}>
          <strong>오류</strong>
          {err}
        </div>
      )}

      <section className="section" aria-labelledby="admin-board-list">
        <div className="section-head">
          <h2 id="admin-board-list">최근 글</h2>
        </div>

        {!loading && rows.length === 0 && !err && (
          <div className="callout-box">
            <strong>아직 글이 없어요</strong>
            첫 글이 올라오면 여기에 표시됩니다.
          </div>
        )}

        <div className="board-list">
          <div className="board-row is-head">
            <span>카테고리</span>
            <span>제목</span>
            <span>작성자</span>
            <span>작성일</span>
            <span>관리</span>
          </div>
          {rows.map((p) => (
            <div className="board-row" key={p.id}>
              <span>
                <StickerBadge tone="cyan" rotate="0">
                  {p.categoryName || p.categorySlug || "기타"}
                </StickerBadge>
              </span>
              <span className="board-row-title">
                <Link href={`/board/${p.id}`}>{p.title}</Link>
              </span>
              <span className="board-row-meta">{p.author?.displayName || p.author?.username || "-"}</span>
              <span className="board-row-meta">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString("ko-KR") : "-"}
              </span>
              <span className="board-row-meta">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onDelete(p)}
                  disabled={busy === p.id}
                  style={{ color: "var(--danger)" }}
                >
                  {busy === p.id ? "삭제중…" : "삭제"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
