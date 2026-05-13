"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { adminMenu, contests as mockContests } from "@/lib/content";
import { contests as contestsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATUS_TONE = {
  submission: "pink",
  voting: "cyan",
  ended: "ink",
  announced: "amber",
};

export default function AdminPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [contests, setContests] = useState(mockContests);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await contestsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.contests || [];
        if (list.length) {
          setContests(list);
          setUsingMock(false);
        }
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>어드민 페이지는 운영자(허락님 본인) 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/admin")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  if (!userLoading && user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>접근 권한이 없습니다</h1>
            <p>이 페이지는 운영자(role=admin) 전용입니다. 일반 계정 ({user.displayName || user.username}) 로 접근하셨습니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">403</StickerBadge>
        </div>
        <div className="callout-box is-pending">
          <strong>안내</strong>
          어드민 권한이 필요하시면 허락님에게 직접 문의해 주세요. 자동 승인 path 는 없습니다.
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
            허락 어드민 <StickerBadge tone="pink" rotate="r">운영자 전용</StickerBadge>
          </h1>
          <p>콘테스트 생성/심사/투표/발표 — 모두 이 페이지에서. 비개발자 self-service 가 목표.</p>
        </div>
        <Link href="/admin/contests/new" className="btn btn-primary">
          + 콘테스트 만들기
        </Link>
      </div>

      <section className="section" aria-labelledby="admin-menu">
        <div className="section-head">
          <h2 id="admin-menu">관리 메뉴</h2>
        </div>
        <div className="grid grid-2">
          {adminMenu.map((m) => (
            <article key={m.id} className="card card-tone-cyan">
              <h3>{m.label}</h3>
              {m.note && <p>{m.note}</p>}
              <div className="card-actions">
                {m.href ? (
                  <Link href={m.href} className="btn btn-sm btn-primary">
                    들어가기
                  </Link>
                ) : (
                  <button type="button" className="btn btn-sm is-disabled" disabled title={m.reason}>
                    들어가기 <span className="btn-note">({m.reason})</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="admin-contests">
        <div className="section-head">
          <h2 id="admin-contests">콘테스트 목록</h2>
          <Link href="/admin/contests/new">+ 새로 만들기</Link>
        </div>
        {usingMock && (
          <div className="callout-box" style={{ marginBottom: 12 }}>
            <strong>안내</strong>
            백엔드에 등록된 콘테스트가 없어 샘플 목록을 표시 중입니다.
          </div>
        )}
        <div className="board-list">
          <div className="board-row is-head">
            <span>상태</span>
            <span>제목</span>
            <span>참가</span>
            <span>마감</span>
            <span>관리</span>
          </div>
          {contests.map((c) => (
            <Link href={`/admin/contests/${c.id}`} key={c.id} className="board-row">
              <span>
                <StickerBadge tone={STATUS_TONE[c.status] || "amber"} rotate="0">
                  {c.statusLabel || c.status}
                </StickerBadge>
              </span>
              <span className="board-row-title">{c.title}</span>
              <span className="board-row-meta">{c.entries ?? 0}명</span>
              <span className="board-row-meta">{c.submissionCloses || "-"}</span>
              <span className="board-row-meta">상세 →</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
