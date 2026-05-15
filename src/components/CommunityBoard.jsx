"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { communityTabs } from "@/lib/content";
import { contests as contestsApi, posts as postsApi } from "@/lib/api-client";

/**
 * CommunityBoard — 던파 공홈 "커뮤니티+" 박스. 탭 4종 + 최근 글 목록.
 *  - tabs: 공지사항 / 이벤트 / 대회 / 자유
 *  - 각 탭 → 실제 backend 카테고리 / 콘테스트 최근 N개
 *  - 행: [카테고리 chip] [제목]  · 우측 메타(작성자/날짜)
 */
const CATEGORY_SLUG_BY_TAB = {
  notice: "broadcast",
  match: "contest_qa",
  free: "talk",
};

const STATUS_LABEL = {
  draft: "임시저장",
  open: "참가중",
  closed: "마감",
  judging: "심사중",
  voting: "투표중",
  results: "결과",
  archived: "보관",
  cancelled: "취소",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function formatAuthor(post) {
  if (post.author?.displayName) return post.author.displayName;
  if (post.authorDisplayName) return post.authorDisplayName;
  if (post.authorNickname) {
    return `${post.authorNickname}${post.anonymousMarker ? `(${post.anonymousMarker})` : ""}`;
  }
  return "ㅇㅇ";
}

function normalizePost(post, tab) {
  return {
    id: `post-${post.id}`,
    category: post.categoryName || post.categoryLabel || communityTabs.find((t) => t.key === tab)?.label || "글",
    title: post.title || "(제목 없음)",
    pinned: Boolean(post.pinned),
    author: formatAuthor(post),
    date: formatDate(post.createdAt),
    href: `/board/${post.id}`,
  };
}

function normalizeContest(contest) {
  return {
    id: `contest-${contest.id}`,
    category: "이벤트",
    title: `${contest.posterEmoji || ""} ${contest.title || "콘테스트"}`.trim(),
    pinned: contest.status === "open",
    author: "허락",
    date: contest.statusLabel || STATUS_LABEL[contest.status] || contest.status || "",
    href: `/contests/${contest.id}`,
  };
}

export default function CommunityBoard() {
  const [tab, setTab] = useState(communityTabs[0].key);
  const [state, setState] = useState({ status: "loading", rows: [] });
  const current = communityTabs.find((t) => t.key === tab);
  const emptyText = useMemo(() => {
    if (state.status === "error") return "목록을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.";
    if (tab === "event") return "진행 중인 이벤트가 없습니다.";
    return "아직 글이 없어요. 첫 글을 남겨주세요.";
  }, [state.status, tab]);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading", rows: [] });
    (async () => {
      try {
        if (tab === "event") {
          const data = await contestsApi.list({ page: 1, pageSize: 5 });
          const list = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.contests)
              ? data.contests
              : Array.isArray(data)
                ? data
                : [];
          if (!alive) return;
          setState({ status: "ready", rows: list.map(normalizeContest) });
          return;
        }

        const data = await postsApi.list({
          categorySlug: CATEGORY_SLUG_BY_TAB[tab],
          page: 1,
          pageSize: 5,
          sort: "recent",
        });
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data)
              ? data
              : [];
        if (!alive) return;
        setState({ status: "ready", rows: list.map((p) => normalizePost(p, tab)) });
      } catch {
        if (alive) setState({ status: "error", rows: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab]);

  return (
    <section className="community-board" aria-labelledby="community-board-title">
      <header className="community-board__head">
        <h2 id="community-board-title">
          <Link
            href={current?.href || "/board"}
            className="community-board__title-link"
            aria-label="커뮤니티 전체 보기"
          >
            커뮤니티<span className="community-board__plus">+</span>
          </Link>
        </h2>
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
        {state.status === "loading" && (
          <li className="community-board__empty">불러오는 중…</li>
        )}
        {state.status !== "loading" && state.rows.length === 0 && (
          <li className="community-board__empty">{emptyText}</li>
        )}
        {state.rows.map((r) => (
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
