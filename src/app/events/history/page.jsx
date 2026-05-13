"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { eventRounds } from "@/lib/event-history";

/**
 * /events/history — 지난 회차(룰렛/이벤트) 결과 기록. 포스트잇 풍 카드.
 * 정렬: 최신 회차 우선 (Round 62 → 1).
 * 검색: 회차 / 당첨자 / 부제(takenBy) 텍스트.
 * 편집: 1차 정적 mock. backend admin endpoint 도입 후 inline CRUD.
 */
const STICKY_TONES = ["yellow", "pink", "cyan", "lime"];

export default function EventHistoryPage() {
  const [q, setQ] = useState("");
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
          {filtered.length} / {sorted.length} 회차
        </small>
      </div>

      <section className="section" aria-label="회차 기록">
        <div className="history-grid">
          {filtered.map((r, i) => {
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
      </section>

      <section className="section" aria-label="편집 안내">
        <article className="card card-tone-amber">
          <h3>편집 기능 (수정 / 추가 / 제거)</h3>
          <p style={{ margin: 0, color: "var(--ink-soft)" }}>
            현재는 정적 표시. backend 어드민 endpoint 도입 후 인라인 편집 활성화. 진행 상황은 운영팀에 문의.
          </p>
        </article>
      </section>
    </PageShell>
  );
}
