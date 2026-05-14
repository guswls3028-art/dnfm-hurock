"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import ContestCard from "@/components/ContestCard";
import StickerBadge from "@/components/StickerBadge";
import { contests as contestsApi } from "@/lib/api-client";

// backend(open/voting/judging/completed) + 이전 mock(submission/voting/ended/announced)
// 둘 다 한 탭으로 묶어 표시.
const TAB_DEFS = [
  { id: "submission", label: "참가중", matches: (s) => s === "submission" || s === "open" },
  { id: "voting", label: "투표중", matches: (s) => s === "voting" || s === "judging" },
  {
    id: "announced",
    label: "결과 발표",
    matches: (s) => s === "announced" || s === "ended" || s === "completed",
  },
];

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await contestsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.contests || [];
        setContests(list);
      } catch {
        if (alive) setContests([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = TAB_DEFS.map((t) => ({
    ...t,
    items: contests.filter((c) => t.matches(c.status)),
  }));

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <h1>
            허락 콘테스트 <StickerBadge tone="pink" rotate="r">참가/투표</StickerBadge>
          </h1>
          <p>
            아바타 콘테스트가 메인 이벤트입니다. 모험단명/캐릭터명/코디 제목/설명/사진 한 장으로 참가 가능.
          </p>
        </div>
      </div>

      {!loading && contests.length === 0 && (
        <div className="callout-box" style={{ marginBottom: 12 }}>
          <strong>안내</strong>
          진행중인 콘테스트가 없습니다. 곧 새 콘테스트가 열려요.
        </div>
      )}

      {grouped.map((tab) => (
        <section key={tab.id} className="section" aria-labelledby={`tab-${tab.id}`}>
          <div className="section-head">
            <h2 id={`tab-${tab.id}`}>
              {tab.label}{" "}
              <span style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 800 }}>
                ({tab.items.length})
              </span>
            </h2>
          </div>
          {tab.items.length === 0 ? (
            <div className="callout-box">아직 이 단계 콘테스트가 없습니다.</div>
          ) : (
            <div className="grid grid-3">
              {tab.items.map((c, i) => (
                <ContestCard key={c.id} contest={c} tilt={i % 2 === 0 ? "l" : "r"} />
              ))}
            </div>
          )}
        </section>
      ))}
    </PageShell>
  );
}
