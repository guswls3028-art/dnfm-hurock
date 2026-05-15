"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import ContestCard from "@/components/ContestCard";
import StickerBadge from "@/components/StickerBadge";
import { contests as contestsApi } from "@/lib/api-client";

const TAB_DEFS = [
  { id: "open", label: "참가중", matches: (s) => s === "open" },
  { id: "voting", label: "심사/투표", matches: (s) => s === "closed" || s === "voting" || s === "judging" },
  {
    id: "completed",
    label: "결과 발표",
    matches: (s) => s === "results" || s === "archived",
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
            진행 중인 콘테스트, 투표, 결과 발표를 한곳에서 확인합니다.
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
