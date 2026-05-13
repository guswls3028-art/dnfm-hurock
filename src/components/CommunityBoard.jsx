"use client";

import Link from "next/link";
import { useState } from "react";
import { communityTabs, boardPosts as mockBoardPosts, noticeBoard, contests as mockContests } from "@/lib/content";

/**
 * CommunityBoard — 던파 공홈 "커뮤니티+" 박스. 탭 4종 + 최근 글 목록.
 *  - tabs: 공지사항 / 이벤트 / 대회 / 자유
 *  - 각 탭 → 해당 카테고리 최근 N개 (mock + 추후 백엔드 list)
 *  - 행: [카테고리 chip] [제목]  · 우측 메타(작성자/날짜)
 */
const TAB_DATA = {
  notice: () =>
    noticeBoard.map((n) => ({
      id: `notice-${n.id}`,
      category: "공지사항",
      title: n.title,
      pinned: n.pinned,
      author: "허락",
      date: n.posted,
      href: "/board",
    })),
  event: () =>
    mockContests.slice(0, 5).map((c) => ({
      id: `event-${c.id}`,
      category: "이벤트",
      title: `${c.posterEmoji || ""} ${c.title}`.trim(),
      pinned: c.status === "submission",
      author: "허락",
      date: c.statusLabel,
      href: `/contests/${c.id}`,
    })),
  match: () =>
    mockBoardPosts
      .filter((p) => /콘테스트|대회/.test(p.category) || /대회|콘테스트|팟/.test(p.title))
      .slice(0, 5)
      .map((p) => ({
        id: `match-${p.id}`,
        category: "대회",
        title: p.title,
        author: p.author,
        date: p.date,
        href: `/board/${p.id}`,
      })),
  free: () =>
    mockBoardPosts
      .filter((p) => !["공지/안내"].includes(p.category))
      .slice(0, 5)
      .map((p) => ({
        id: `free-${p.id}`,
        category: p.category || "자유",
        title: p.title,
        author: p.author,
        date: p.date,
        href: `/board/${p.id}`,
      })),
};

export default function CommunityBoard() {
  const [tab, setTab] = useState(communityTabs[0].key);
  const rows = TAB_DATA[tab] ? TAB_DATA[tab]() : [];
  const current = communityTabs.find((t) => t.key === tab);

  return (
    <section className="community-board" aria-labelledby="community-board-title">
      <header className="community-board__head">
        <h2 id="community-board-title">
          커뮤니티<span className="community-board__plus">+</span>
        </h2>
        <Link href={current?.href || "/board"} className="community-board__all">
          전체 보기 →
        </Link>
      </header>

      <div className="community-board__tabs" role="tablist" aria-label="커뮤니티 탭">
        {communityTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`community-board__tab community-board__tab--${t.tone}${tab === t.key ? " is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="community-board__list">
        {rows.length === 0 && (
          <li className="community-board__empty">아직 글이 없어요. 첫 글을 남겨주세요.</li>
        )}
        {rows.map((r) => (
          <li key={r.id} className="community-board__row">
            <span className={`community-board__cat community-board__cat--${current?.tone || "cyan"}`}>
              {r.category}
            </span>
            <Link href={r.href} className="community-board__title">
              {r.pinned && <span className="community-board__pin" aria-hidden="true">📌</span>}
              {r.title}
            </Link>
            <span className="community-board__meta">{r.author}</span>
            <span className="community-board__meta">{r.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
