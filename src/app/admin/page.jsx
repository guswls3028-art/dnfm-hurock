"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { adminMenu } from "@/lib/content";
import { contests as contestsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATUS_TONE = {
  draft: "ink",
  open: "pink",
  judging: "amber",
  voting: "cyan",
  completed: "amber",
};

const STATUS_LABEL = {
  draft: "임시저장",
  open: "참가 모집",
  judging: "후보 심사",
  voting: "투표중",
  completed: "결과 발표",
};

export default function AdminPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [contests, setContests] = useState([]);
  const [contestsLoaded, setContestsLoaded] = useState(false);
  const [contestError, setContestError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await contestsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.contests || [];
        setContests(list);
      } catch (err) {
        if (alive) setContestError(err?.message || "콘테스트 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setContestsLoaded(true);
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
          어드민 권한이 필요하시면 허락님에게 직접 문의해 주세요. 자동 승인 절차는 제공하지 않습니다.
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
          <p>콘테스트 생성, 참가작 심사, 투표 전환, 결과 발표를 한곳에서 관리합니다.</p>
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
        {contestsLoaded && contests.length === 0 && (
          <div className="callout-box" style={{ marginBottom: 12 }}>
            <strong>콘테스트 없음</strong>
            아직 만든 콘테스트가 없어요. 오른쪽 "+ 새로 만들기" 로 시작하세요.
          </div>
        )}
        {contestError ? (
          <div className="callout-box is-pending" style={{ marginBottom: 12 }}>
            <strong>불러오기 실패</strong>
            {contestError}
          </div>
        ) : null}
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
                  {c.statusLabel || STATUS_LABEL[c.status] || c.status}
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
