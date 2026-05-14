"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { eventRounds } from "@/lib/event-history";

/**
 * /events/history — 지난 회차(룰렛/이벤트) 결과 기록. 포스트잇 풍 카드.
 * 정렬: 최신 회차 우선 (Round 62 → 1).
 * 검색: 회차 / 당첨자 / 부제(takenBy) 텍스트.
 * 기본 노출 = 최근 12회차. "전체 보기" 토글로 전 회차 펼침.
 */
const STICKY_TONES = ["yellow", "pink", "cyan", "lime"];
const RECENT_LIMIT = 12;

export default function EventHistoryPage() {
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(() => [...eventRounds].sort((a, b) => b.round - a.round), []);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((r) => {
      const blob = [
        `${r.round}회`,
        r.type || "",
        r.takenBy || "",
        r.winner || "",
        r.prize || "",
        ...(r.participants || []),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(term);
    });
  }, [sorted, q]);

  // 검색 중이면 결과 전체 노출. 빈 검색일 땐 최근 N회차 + 더 보기.
  const isSearching = q.trim().length > 0;
  const visible = isSearching || showAll ? filtered : filtered.slice(0, RECENT_LIMIT);
  const hasMore = !isSearching && !showAll && filtered.length > RECENT_LIMIT;

  return (
    <PageShell activePath="/events">
      <div className="page-head">
        <div>
          <h1>
            지난 회차 기록 <StickerBadge tone="amber" rotate="r">{eventRounds.length}회차</StickerBadge>
          </h1>
          <p>핀볼 / 룰렛 / 이벤트 회차별 당첨자와 참가자 목록. 회차·당첨자·먹은 사람으로 검색.</p>
        </div>
      </div>

      <div className="form-block" style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input
          type="search"
          className="form-input"
          placeholder="회차 / 당첨자 / 닉네임 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <small style={{ color: "var(--ink-soft)", fontWeight: 800 }}>
          {isSearching
            ? `${filtered.length} / ${sorted.length} 회차`
            : showAll
              ? `전체 ${sorted.length}회차`
              : `최근 ${Math.min(RECENT_LIMIT, sorted.length)}회차 (전체 ${sorted.length})`}
        </small>
      </div>

      <section className="section" aria-label="회차 기록">
        <div className="history-grid">
          {visible.map((r, i) => {
            const tone = STICKY_TONES[(r.round - 1) % STICKY_TONES.length];
            return (
              <article key={r.round} className={`postit postit-${tone}`} data-tilt={i % 2 === 0 ? "l" : "r"}>
                <header className="postit-head">
                  <span className="postit-round">{r.round}회</span>
                  {r.type ? <StickerBadge tone="pink" rotate="r">{r.type}</StickerBadge> : null}
                  {r.takenBy ? <StickerBadge tone="cyan" rotate="0">{r.takenBy}</StickerBadge> : null}
                </header>
                <div className="postit-winner">
                  <strong>{r.winner || "-"}</strong>
                  {r.prize ? <small>{r.prize}</small> : null}
                </div>
                <details className="postit-participants">
                  <summary>참가자 {r.participants?.length || 0}명</summary>
                  <ul>
                    {(r.participants || []).map((p, idx) => (
                      <li key={`${r.round}-${idx}`}>{p}</li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="callout-box">검색 결과 없음.</div>
        )}
        {hasMore && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAll(true)}
            >
              전체 {filtered.length}회차 보기 ↓
            </button>
          </div>
        )}
        {!isSearching && showAll && filtered.length > RECENT_LIMIT && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowAll(false)}
            >
              최근 {RECENT_LIMIT}회차만 보기 ↑
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
