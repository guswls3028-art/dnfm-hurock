"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { contests } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

const ENTRY_LABEL = {
  draft: "작성중",
  submitted: "제출됨",
  approved: "공개 승인",
  rejected: "반려",
  hidden: "숨김",
  winner: "수상",
  disqualified: "실격",
};

const ENTRY_TONE = {
  submitted: "cyan",
  approved: "lime",
  winner: "pink",
  rejected: "ink",
  hidden: "ink",
  disqualified: "ink",
};

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function MyEventsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading || !user) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contests.myEntries();
        if (alive) setItems(data?.items || []);
      } catch (err) {
        if (alive) setError(err?.message || "내 이벤트 상태를 불러오지 못했습니다.");
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
      <PageShell activePath="/me/events">
        <div className="page-head">
          <div>
            <h1>로그인 확인 중…</h1>
            <p>내 이벤트 상태를 불러오기 전에 로그인 상태를 확인하고 있습니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">확인중</StickerBadge>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell activePath="/me/events">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>내 이벤트 참가 상태는 로그인 후 확인할 수 있습니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">내 상태</StickerBadge>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/me/events")}`} className="btn btn-primary">
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/me/events">
      <div className="page-head">
        <div>
          <h1>
            내 이벤트 상태 <StickerBadge tone="cyan" rotate="r">MY EVENTS</StickerBadge>
          </h1>
          <p>내가 제출한 참가작의 승인, 후보, 투표, 결과 상태를 확인합니다.</p>
        </div>
        <Link href="/contests" className="btn btn-primary">이벤트 목록</Link>
      </div>

      {error ? (
        <div className="callout-box is-pending">
          <strong>불러오기 실패</strong>
          {error}
        </div>
      ) : null}

      <section className="section" aria-labelledby="my-event-list">
        <div className="section-head">
          <h2 id="my-event-list">참가 기록</h2>
        </div>
        <div className="board-list">
          <div className="board-row is-head">
            <span>참가작</span>
            <span>이벤트</span>
            <span>상태</span>
            <span>후보</span>
            <span>제출</span>
          </div>
          {items.map(({ entry, contest }) => {
            const fields = entry?.fields || {};
            const title = fields.title || fields.characterName || fields.adventureName || "참가작";
            return (
              <Link href={`/contests/${contest.id}`} key={entry.id} className="board-row">
                <span className="board-row-title">{title}</span>
                <span className="board-row-meta">{contest.title}</span>
                <span>
                  <StickerBadge tone={ENTRY_TONE[entry.status] || "amber"} rotate="0">
                    {ENTRY_LABEL[entry.status] || entry.status}
                  </StickerBadge>
                </span>
                <span className="board-row-meta">{entry.selectedForVote ? "선정" : "-"}</span>
                <span className="board-row-meta">{formatDate(entry.createdAt)}</span>
              </Link>
            );
          })}
        </div>
        {!loading && items.length === 0 ? (
          <div className="callout-box">
            <strong>참가 기록 없음</strong>
            아직 제출한 이벤트 참가작이 없습니다.
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
