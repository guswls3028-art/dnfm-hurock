import Link from "next/link";
import { boardEntryCategories } from "@/lib/content";

/**
 * BoardEntryGrid — 첫 화면 게시판 카테고리 진입 5종.
 *  - 클릭 시 /board?category={key} 로 이동
 *  - tone 별 카드 띠색
 *  - sticker-rotate-* 톤 따라 살짝 기울어짐
 */
export default function BoardEntryGrid() {
  return (
    <div className="board-entry-grid grid grid-5" role="list">
      {boardEntryCategories.map((c, i) => (
        <Link
          key={c.key}
          href={c.href || `/board?category=${encodeURIComponent(c.key)}`}
          className={`board-entry-card card card-tone-${c.tone}`}
          data-tilt={i % 2 === 0 ? "l" : "r"}
          role="listitem"
        >
          <span className="board-entry-card__emoji" aria-hidden="true">
            {c.emoji}
          </span>
          <strong className="board-entry-card__label">{c.label}</strong>
          <span className="board-entry-card__note">{c.note}</span>
        </Link>
      ))}
    </div>
  );
}
