"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { posts as postsApi } from "@/lib/api-client";

/**
 * QuickNotice — 슬라이더 아래 빠른 안내 (던파 공홈 [공지] [업데이트] 2줄 레이어).
 *  - default: folded:false 만 노출
 *  - 펼치기 ⌄: folded:true 까지 모두
 *  - tag color: cyan(공지) / amber(업데이트) / pink(이벤트)
 */
export default function QuickNotice() {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ status: "loading", notices: [] });
  const hasFolded = state.notices.length > 2;
  const visible = expanded ? state.notices : state.notices.slice(0, 2);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await postsApi.list({
          categorySlug: "broadcast",
          page: 1,
          pageSize: 4,
          sort: "recent",
        });
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data)
              ? data
              : [];
        const notices = list.map((post) => ({
          id: post.id,
          tag: post.flair || post.categoryName || "방송",
          tagTone: post.flair === "업데이트" ? "amber" : "cyan",
          text: post.title || "(제목 없음)",
          href: `/board/${post.id}`,
        }));
        if (alive) setState({ status: "ready", notices });
      } catch {
        if (alive) setState({ status: "error", notices: [] });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="quick-notice" aria-label="공지 / 업데이트 빠른 안내">
      <ul className="quick-notice__list">
        {state.status === "loading" && (
          <li className="quick-notice__row">
            <span className="quick-notice__tag quick-notice__tag--cyan">공지</span>
            <span className="quick-notice__text">불러오는 중...</span>
          </li>
        )}
        {state.status !== "loading" && visible.length === 0 && (
          <li className="quick-notice__row">
            <span className="quick-notice__tag quick-notice__tag--cyan">공지</span>
            <span className="quick-notice__text">
              {state.status === "error" ? "공지 목록을 불러오지 못했어요." : "등록된 방송 공지가 없습니다."}
            </span>
          </li>
        )}
        {visible.map((n) => (
          <li key={n.id} className="quick-notice__row">
            <span className={`quick-notice__tag quick-notice__tag--${n.tagTone || "cyan"}`}>
              {n.tag}
            </span>
            {n.href ? (
              <Link href={n.href} className="quick-notice__text">
                {n.text}
              </Link>
            ) : (
              <span className="quick-notice__text">{n.text}</span>
            )}
          </li>
        ))}
      </ul>
      {hasFolded && (
        <button
          type="button"
          className={`quick-notice__toggle${expanded ? " is-expanded" : ""}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "공지 줄이기" : "공지 모두 보기"}
        >
          {expanded ? "접기 ⌃" : "더 보기 ⌄"}
        </button>
      )}
    </section>
  );
}
