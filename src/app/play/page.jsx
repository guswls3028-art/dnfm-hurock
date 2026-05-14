"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";

/**
 * /play — 방송 중 쓰는 게임 포탈.
 * 외부 게임 바로가기 + 인라인 즉석 뽑기 (참가자 paste → 무작위 1명).
 */
const GAMES = [
  {
    id: "kr-roulette",
    label: "한글 도메인 룰렛",
    url: "https://xn--ok0bj0i6sfoyp9no.com/",
    note: "쓸 ID/PS 로 로그인 후 운영",
    emoji: "🎰",
    tone: "pink",
  },
  {
    id: "lazygyu-roulette",
    label: "lazygyu 핀볼 룰렛",
    url: "https://lazygyu.github.io/roulette/",
    note: "참가자 이름 붙여넣기 → 핀볼 떨굼",
    emoji: "🎯",
    tone: "cyan",
  },
];

function parseParticipants(text) {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function pickRandom(list) {
  if (list.length === 0) return null;
  const idx = Math.floor(Math.random() * list.length);
  return { winner: list[idx], idx };
}

export default function PlayPortalPage() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const participants = parseParticipants(raw);

  function handlePick() {
    if (participants.length === 0) {
      setResult({ error: "참가자를 한 줄에 한 명씩 (또는 쉼표로) 적어 주세요." });
      return;
    }
    const r = pickRandom(participants);
    setResult({ winner: r.winner, count: participants.length, ts: Date.now() });
    setHistory((h) => [{ winner: r.winner, count: participants.length, ts: Date.now() }, ...h].slice(0, 5));
  }

  function handleReset() {
    setRaw("");
    setResult(null);
  }

  return (
    <PageShell activePath="/play">
      <div className="page-head">
        <div>
          <h1>방송 게임 포탈 <StickerBadge tone="cyan" rotate="r">바로가기</StickerBadge></h1>
          <p>매번 새 창 띄우기 번거로워서 한 페이지에 모았어요. 즉석 뽑기는 아래에서 바로 가능.</p>
        </div>
      </div>

      <section className="section" aria-labelledby="play-quick">
        <div className="section-head">
          <h2 id="play-quick">즉석 뽑기 <StickerBadge tone="pink" rotate="r">방송용</StickerBadge></h2>
        </div>
        <article className="card card-tone-yellow play-quick-pick">
          <p style={{ margin: "0 0 8px", color: "var(--ink-soft)", fontWeight: 800 }}>
            참가자 닉네임을 한 줄에 한 명씩 붙여넣고 <b>뽑기</b> 클릭. 외부 룰렛 안 켜도 즉석 추첨 가능.
          </p>
          <textarea
            className="form-input"
            rows={6}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"외계가재\n허락팬1\nLynn-kr5ky\n..."}
            style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: "0.92rem" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={handlePick}>
              🎲 뽑기 ({participants.length}명)
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={handleReset}>
              초기화
            </button>
            <small style={{ color: "var(--muted)", fontWeight: 800 }}>
              한 줄에 한 명씩 · 쉼표/세미콜론 구분도 OK
            </small>
          </div>
          {result?.error ? (
            <div className="callout-box" style={{ marginTop: 12 }}>
              <strong>안내</strong>
              {result.error}
            </div>
          ) : result?.winner ? (
            <div className="play-quick-pick__result" role="status" aria-live="polite">
              <span aria-hidden="true">🎉</span>
              <strong>{result.winner}</strong>
              <small>{result.count}명 중 1명 추첨</small>
            </div>
          ) : null}
          {history.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--ink-soft)" }}>
                최근 뽑기 ({history.length})
              </summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {history.map((h, i) => (
                  <li key={`${h.ts}-${i}`} style={{ fontSize: "0.88rem" }}>
                    <strong>{h.winner}</strong>{" "}
                    <small style={{ color: "var(--muted)" }}>({h.count}명 중)</small>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </article>
      </section>

      <section className="section" aria-labelledby="play-games">
        <div className="section-head">
          <h2 id="play-games">외부 게임 사이트</h2>
        </div>
        <div className="grid grid-2">
          {GAMES.map((g, i) => (
            <a
              key={g.id}
              className={`card card-tone-${g.tone}`}
              href={g.url}
              target="_blank"
              rel="noreferrer"
              data-tilt={i % 2 === 0 ? "l" : "r"}
              style={{ textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2.2rem", lineHeight: 1 }} aria-hidden="true">
                  {g.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0 }}>{g.label}</h3>
                  <small style={{ color: "var(--ink-soft)", fontWeight: 800 }}>{g.note}</small>
                </div>
                <StickerBadge tone="amber" rotate="r">새 탭 ↗</StickerBadge>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "0.84rem", color: "var(--muted)", wordBreak: "break-all" }}>
                {g.url}
              </p>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
