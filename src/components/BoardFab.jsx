"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * hurock 게시판 우측 하단 floating action.
 * B급 톤 — 핫핑크 원형 + 살짝 회전 + 굵은 ink border.
 */
export default function BoardFab({ href = "/board/new" }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="board-fab-hurock" aria-label="게시판 빠른 액션">
      {showTop ? (
        <button
          type="button"
          className="board-fab-hurock__btn board-fab-hurock__btn--top"
          onClick={scrollTop}
          aria-label="맨 위로"
          title="맨 위로"
        >
          ↑
        </button>
      ) : null}
      <Link
        href={href}
        className="board-fab-hurock__btn board-fab-hurock__btn--write"
        aria-label="글쓰기"
        title="글쓰기"
      >
        ✏
      </Link>
    </div>
  );
}
