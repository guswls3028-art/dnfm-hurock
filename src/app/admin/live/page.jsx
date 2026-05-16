"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { broadcast } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATUS_LABEL = {
  draft: "준비중",
  open: "참가 접수중",
  closed: "접수 마감",
  voting: "공개투표",
  judging: "심사중",
  results: "결과 발표",
  archived: "보관됨",
  cancelled: "취소됨",
};

const QUESTION_LABEL = {
  received: "접수",
  shortlisted: "후보",
  on_air: "방송중",
  answered: "완료",
  hidden: "숨김",
  rejected: "반려",
};

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function AdminLivePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading || !user || !isAdmin(user)) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await broadcast.dashboard();
        if (alive) setDashboard(data);
      } catch (err) {
        if (alive) setError(err?.message || "방송 운영실 데이터를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, userLoading]);

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
            <p>방송 운영실은 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/admin/live")}`} className="btn btn-primary">
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
            <p>허락 운영자 계정으로만 접근할 수 있습니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">403</StickerBadge>
        </div>
      </PageShell>
    );
  }

  const contests = dashboard?.contests || [];
  const counts = dashboard?.questionCounts || {};
  const recentQuestions = dashboard?.recentQuestions || [];
  const recentDraws = dashboard?.recentDraws || [];

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            방송 운영실 <StickerBadge tone="cyan" rotate="r">LIVE OPS</StickerBadge>
          </h1>
          <p>진행 이벤트, 질문 큐, 추첨 기록을 방송 흐름 기준으로 확인합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/admin/questions" className="btn btn-primary">질문 큐</Link>
          <Link href="/admin/draws" className="btn btn-cyan">추첨 실행</Link>
          <Link href="/broadcast/questions/live" className="btn btn-ghost" target="_blank">OBS 화면</Link>
        </div>
      </div>

      {error ? (
        <div className="callout-box is-pending">
          <strong>불러오기 실패</strong>
          {error}
        </div>
      ) : null}

      <section className="section" aria-labelledby="ops-status">
        <div className="section-head">
          <h2 id="ops-status">방송 상태판</h2>
        </div>
        <div className="grid grid-2">
          <article className="card card-tone-cyan">
            <h3>질문 큐</h3>
            <p style={{ marginBottom: 10 }}>접수 {counts.received || 0}건 · 후보 {counts.shortlisted || 0}건 · 방송중 {counts.on_air || 0}건</p>
            <Link href="/admin/questions" className="btn btn-sm btn-primary">질문 관리</Link>
          </article>
          <article className="card card-tone-pink">
            <h3>진행 이벤트</h3>
            <p style={{ marginBottom: 10 }}>{loading ? "불러오는 중" : `${contests.length}개 운영중`}</p>
            <Link href="/admin/contests/new" className="btn btn-sm btn-primary">콘테스트 만들기</Link>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="ops-contests">
        <div className="section-head">
          <h2 id="ops-contests">진행 이벤트</h2>
          <Link href="/admin">전체 관리</Link>
        </div>
        <div className="board-list">
          <div className="board-row is-head">
            <span>상태</span>
            <span>이벤트</span>
            <span>참가</span>
            <span>투표</span>
            <span>관리</span>
          </div>
          {contests.map(({ contest, counts: itemCounts }) => (
            <Link href={`/admin/contests/${contest.id}`} key={contest.id} className="board-row">
              <span>
                <StickerBadge tone={contest.status === "voting" ? "cyan" : "amber"} rotate="0">
                  {STATUS_LABEL[contest.status] || contest.status}
                </StickerBadge>
              </span>
              <span className="board-row-title">{contest.title}</span>
              <span className="board-row-meta">{itemCounts?.entries || 0}건</span>
              <span className="board-row-meta">{itemCounts?.votes || 0}표</span>
              <span className="board-row-meta">상세</span>
            </Link>
          ))}
          {!loading && contests.length === 0 ? (
            <div className="callout-box">
              <strong>진행중 이벤트 없음</strong>
              접수·투표·심사·결과 발표 상태의 이벤트가 없습니다.
            </div>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="ops-questions">
        <div className="section-head">
          <h2 id="ops-questions">최근 질문</h2>
          <Link href="/admin/questions">질문 큐</Link>
        </div>
        <div className="board-list">
          {recentQuestions.map((q) => (
            <div key={q.id} className="board-row">
              <span>
                <StickerBadge tone={q.status === "on_air" ? "pink" : "cyan"} rotate="0">
                  {QUESTION_LABEL[q.status] || q.status}
                </StickerBadge>
              </span>
              <span className="board-row-title">{q.content}</span>
              <span className="board-row-meta">{q.nickname || "익명"}</span>
              <span className="board-row-meta">{q.category}</span>
              <span className="board-row-meta">{formatDate(q.updatedAt || q.createdAt)}</span>
            </div>
          ))}
          {!loading && recentQuestions.length === 0 ? (
            <div className="callout-box">
              <strong>질문 없음</strong>
              아직 방송 질문이 접수되지 않았습니다.
            </div>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="ops-draws">
        <div className="section-head">
          <h2 id="ops-draws">최근 추첨</h2>
          <Link href="/admin/draws">추첨 실행</Link>
        </div>
        <div className="board-list">
          {recentDraws.map((draw) => (
            <div key={draw.id} className="board-row">
              <span>
                <StickerBadge tone="amber" rotate="0">{draw.roundNumber ? `${draw.roundNumber}회차` : "추첨"}</StickerBadge>
              </span>
              <span className="board-row-title">{draw.title}</span>
              <span className="board-row-meta">{draw.prize || "-"}</span>
              <span className="board-row-meta">{Array.isArray(draw.winners) ? draw.winners.join(", ") : "-"}</span>
              <span className="board-row-meta">{formatDate(draw.executedAt)}</span>
            </div>
          ))}
          {!loading && recentDraws.length === 0 ? (
            <div className="callout-box">
              <strong>추첨 기록 없음</strong>
              서버에서 실행한 추첨 기록이 아직 없습니다.
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
