"use client";

import Link from "next/link";
import { useState } from "react";
import { quickNotices } from "@/lib/content";

/**
 * QuickNotice — 슬라이더 아래 빠른 안내 (던파 공홈 [공지] [업데이트] 2줄 레이어).
 *  - default: folded:false 만 노출
 *  - 펼치기 ⌄: folded:true 까지 모두
 *  - tag color: cyan(공지) / amber(업데이트) / pink(이벤트)
 */
export default function QuickNotice() {
  const [expanded, setExpanded] = useState(false);
  const hasFolded = quickNotices.some((n) => n.folded);
  const visible = expanded ? quickNotices : quickNotices.filter((n) => !n.folded);

  return (
    <section className="quick-notice" aria-label="공지 / 업데이트 빠른 안내">
      <ul className="quick-notice__list">
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
