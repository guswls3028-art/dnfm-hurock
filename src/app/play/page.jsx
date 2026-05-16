"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { draws } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * /play — 방송 게임 포탈.
 * 공식 추첨은 서버에서 실행된 draw_sessions 기록을 기준으로 공개한다.
 */
const GAMES = [
  {
    id: "kr-roulette",
    label: "한글 도메인 룰렛",
    url: "https://xn--ok0bj0i6sfoyp9no.com/",
    note: "외부 룰렛 연출용",
    emoji: "🎰",
    tone: "pink",
  },
  {
    id: "lazygyu-roulette",
    label: "lazygyu 핀볼 룰렛",
    url: "https://lazygyu.github.io/roulette/",
    note: "방송 화면 연출용",
    emoji: "🎯",
    tone: "cyan",
  },
];

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

export default function PlayPortalPage() {
  const { user } = useCurrentUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await draws.list({ pageSize: 30 });
        if (alive) setHistory(data?.items || []);
      } catch (err) {
        if (alive) setError(err?.message || "추첨 기록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageShell activePath="/play">
      <div className="page-head">
        <div>
          <h1>
            방송 게임 포탈 <StickerBadge tone="cyan" rotate="r">기록 중심</StickerBadge>
          </h1>
          <p>상품이 걸린 추첨은 서버 기록 기준으로 남기고, 외부 룰렛은 방송 연출 도구로 씁니다.</p>
        </div>
        {isAdmin(user) ? (
          <Link href="/admin/draws" className="btn btn-primary">추첨 실행</Link>
        ) : null}
      </div>

      <section className="section" aria-labelledby="draw-history">
        <div className="section-head">
          <h2 id="draw-history">추첨 기록</h2>
        </div>
        {error ? (
          <div className="callout-box is-pending">
            <strong>불러오기 실패</strong>
            {error}
          </div>
        ) : null}
        <div className="board-list">
          <div className="board-row is-head">
            <span>회차</span>
            <span>이벤트</span>
            <span>상품</span>
            <span>당첨자</span>
            <span>시간</span>
          </div>
          {history.map((draw) => (
            <div key={draw.id} className="board-row">
              <span>
                <StickerBadge tone="amber" rotate="0">{draw.roundNumber ? `${draw.roundNumber}회` : "추첨"}</StickerBadge>
              </span>
              <span className="board-row-title">{draw.title}</span>
              <span className="board-row-meta">{draw.prize || "-"}</span>
              <span className="board-row-meta">{Array.isArray(draw.winners) ? draw.winners.join(", ") : "-"}</span>
              <span className="board-row-meta">{formatDate(draw.executedAt)}</span>
            </div>
          ))}
        </div>
        {!loading && history.length === 0 ? (
          <div className="callout-box">
            <strong>추첨 기록 없음</strong>
            아직 서버에 저장된 추첨 기록이 없습니다.
          </div>
        ) : null}
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
                <StickerBadge tone="amber" rotate="r">새 탭</StickerBadge>
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
