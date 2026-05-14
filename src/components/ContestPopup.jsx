"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StickerBadge from "@/components/StickerBadge";
import { contests as mockContests } from "@/lib/content";
import { contests as contestsApi } from "@/lib/api-client";

const HIDE_KEY = "hurock_contest_popup_hide_until";
const HIDE_DAYS = 7;

// backend lifecycle (draft/open/judging/voting/completed) ↔ mock 라이프사이클
// (submission/voting/ended/announced) 둘 중 어느 것이든 "참가 모집중" 으로
// 간주하는 상태들.
const OPEN_STATUSES = new Set(["submission", "open"]);

/**
 * ContestPopup — 첫 진입 시 메인 콘테스트 풀스크린(모바일) 모달.
 *  - backend list 우선 (참가 모집중 첫 콘테스트), 없으면 mock fallback
 *  - X 닫기 → 세션만 보지 않음
 *  - "7일 동안 다시 보지 않기" → localStorage HIDE_KEY 에 +7일 timestamp 저장
 */
export default function ContestPopup() {
  const [open, setOpen] = useState(false);
  const [contest, setContest] = useState(null);

  useEffect(() => {
    let suppressed = false;
    try {
      const v = localStorage.getItem(HIDE_KEY);
      if (v && Number(v) > Date.now()) suppressed = true;
    } catch { /* localStorage 차단 환경 — 그냥 노출 */ }
    if (suppressed) return;

    let alive = true;
    (async () => {
      let target = null;
      try {
        const data = await contestsApi.list();
        const list = Array.isArray(data) ? data : data?.contests || data?.items || [];
        target = list.find((c) => OPEN_STATUSES.has(c.status)) || null;
      } catch { /* backend 미가용 — mock fallback */ }
      if (!target) {
        target = mockContests.find((c) => OPEN_STATUSES.has(c.status)) || null;
      }
      if (!alive || !target) return;
      setContest(target);
      setOpen(true);
    })();
    return () => { alive = false; };
  }, []);

  function close() {
    setOpen(false);
  }

  function hideForWeek() {
    try {
      const until = Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(HIDE_KEY, String(until));
    } catch { /* noop */ }
    setOpen(false);
  }

  if (!open || !contest) return null;

  return (
    <div
      className="contest-popup__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contest-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="contest-popup">
        <button
          type="button"
          className="contest-popup__close"
          aria-label="닫기"
          onClick={close}
        >
          ✕
        </button>

        <div className="contest-popup__head">
          <StickerBadge tone="pink" rotate="r">{contest.statusLabel || "참가 모집중"}</StickerBadge>
          {contest.eventAt ? (
            <StickerBadge tone="cyan" rotate="0">📅 {contest.eventAt}</StickerBadge>
          ) : null}
        </div>

        <h2 id="contest-popup-title" className="contest-popup__title">
          {contest.posterEmoji ? `${contest.posterEmoji} ` : ""}
          {contest.title}
        </h2>
        {contest.subtitle ? <p className="contest-popup__sub">{contest.subtitle}</p> : null}

        {contest.prizePool ? (
          <div className="contest-popup__prize">
            🎁 <strong>{contest.prizePool}</strong>
          </div>
        ) : null}

        {Array.isArray(contest.categories) && contest.categories.length ? (
          <ul className="contest-popup__cats">
            {contest.categories.slice(0, 5).map((cat) => (
              <li key={cat.key}>
                <span aria-hidden="true">{cat.emoji}</span>{cat.label}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="contest-popup__actions">
          <Link
            href={`/contests/${contest.id}/new`}
            className="btn btn-primary contest-popup__cta"
            onClick={close}
          >
            지금 참가하기 →
          </Link>
          <Link
            href={`/contests/${contest.id}`}
            className="btn btn-sm"
            onClick={close}
          >
            자세히 보기
          </Link>
        </div>

        <button
          type="button"
          className="contest-popup__hide7"
          onClick={hideForWeek}
        >
          7일 동안 다시 보지 않기
        </button>
      </div>
    </div>
  );
}
