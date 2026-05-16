"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { draws } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

function parseParticipants(text) {
  return text
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

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

export default function AdminDrawsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [prize, setPrize] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [participantsText, setParticipantsText] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const participants = useMemo(() => parseParticipants(participantsText), [participantsText]);

  async function loadHistory() {
    try {
      const data = await draws.list({ pageSize: 30 });
      setHistory(data?.items || []);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    if (userLoading || !user || !isAdmin(user)) return;
    loadHistory();
  }, [user, userLoading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const data = await draws.create({
        title,
        roundNumber: roundNumber ? Number(roundNumber) : undefined,
        prize,
        participants,
        winnerCount: Number(winnerCount),
        note,
      });
      const drawSession = data?.drawSession || data;
      setResult(drawSession);
      setHistory((prev) => [drawSession, ...prev.filter((item) => item.id !== drawSession.id)]);
    } catch (err) {
      setError(err?.message || "추첨 실행에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

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
            <p>추첨 실행은 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/admin/draws")}`} className="btn btn-primary">
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

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            추첨 기록실 <StickerBadge tone="amber" rotate="r">SERVER DRAW</StickerBadge>
          </h1>
          <p>참가자 목록을 저장하고 서버에서 당첨자를 뽑아 회차 기록으로 남깁니다.</p>
        </div>
        <Link href="/play" className="btn btn-ghost" target="_blank">공개 기록</Link>
      </div>

      <section className="section" aria-labelledby="draw-form">
        <div className="section-head">
          <h2 id="draw-form">추첨 실행</h2>
        </div>
        <form className="form-block" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <label className="form-row">
              <span>이벤트명</span>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} />
            </label>
            <label className="form-row">
              <span>회차</span>
              <input className="form-input" type="number" min="1" value={roundNumber} onChange={(e) => setRoundNumber(e.target.value)} />
            </label>
            <label className="form-row">
              <span>상품</span>
              <input className="form-input" value={prize} onChange={(e) => setPrize(e.target.value)} maxLength={200} />
            </label>
            <label className="form-row">
              <span>당첨자 수</span>
              <input className="form-input" type="number" min="1" max="20" value={winnerCount} onChange={(e) => setWinnerCount(e.target.value)} />
            </label>
          </div>
          <label className="form-row">
            <span>참가자 목록</span>
            <textarea
              className="form-textarea"
              rows={8}
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder={"허락팬1\n외계가재\n모험단닉네임"}
              required
            />
            <small>{participants.length}명 입력됨 · 줄바꿈/쉼표/세미콜론 구분</small>
          </label>
          <label className="form-row">
            <span>비고</span>
            <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          </label>
          {error ? (
            <div className="callout-box is-pending">
              <strong>실패</strong>
              {error}
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "추첨 중" : `서버 추첨 실행 (${participants.length}명)`}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setParticipantsText("")}>목록 비우기</button>
          </div>
        </form>
      </section>

      {result ? (
        <section className="section" aria-labelledby="draw-result">
          <div className="section-head">
            <h2 id="draw-result">방금 당첨</h2>
          </div>
          <article className="card card-tone-pink">
            <h3>{Array.isArray(result.winners) ? result.winners.join(", ") : "-"}</h3>
            <p>{result.title} · {result.prize || "상품 미입력"} · {Array.isArray(result.participants) ? result.participants.length : 0}명 중 {result.winnerCount}명</p>
          </article>
        </section>
      ) : null}

      <section className="section" aria-labelledby="draw-history">
        <div className="section-head">
          <h2 id="draw-history">추첨 기록</h2>
          <button type="button" className="btn btn-sm btn-ghost" onClick={loadHistory}>새로고침</button>
        </div>
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
                <StickerBadge tone="amber" rotate="0">{draw.roundNumber ? `${draw.roundNumber}회` : "기록"}</StickerBadge>
              </span>
              <span className="board-row-title">{draw.title}</span>
              <span className="board-row-meta">{draw.prize || "-"}</span>
              <span className="board-row-meta">{Array.isArray(draw.winners) ? draw.winners.join(", ") : "-"}</span>
              <span className="board-row-meta">{formatDate(draw.executedAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
