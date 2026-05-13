"use client";

import Link from "next/link";
import { useState } from "react";
import { eventBanners } from "@/lib/content";

/**
 * EventCarousel — 던파 공홈 "열혈 패스" 영역. 큰 이벤트 카드 슬라이딩.
 *  - 좌우 드래그 또는 도트로 idx 변경
 *  - 각 카드: emoji 큰 비주얼 + 제목/부제 + 클릭 시 이벤트 페이지로 이동
 *  - tone 별 배경 그라데이션 (pink/cyan/amber/lime)
 */
export default function EventCarousel() {
  const [idx, setIdx] = useState(0);
  if (!eventBanners.length) return null;
  const total = eventBanners.length;
  const current = eventBanners[idx];

  return (
    <section className="event-carousel" aria-labelledby="event-carousel-title">
      <header className="event-carousel__head">
        <h2 id="event-carousel-title">이벤트</h2>
        <Link href="/events" className="event-carousel__all">전체 보기 →</Link>
      </header>

      <div className="event-carousel__viewport">
        <Link
          href={current.href}
          className={`event-carousel__card event-carousel__card--${current.accentTone || "pink"}`}
          aria-label={`${current.title} — ${current.subtitle}`}
        >
          <span className="event-carousel__emoji" aria-hidden="true">
            {current.emoji}
          </span>
          <div className="event-carousel__copy">
            <strong>{current.title}</strong>
            <small>{current.subtitle}</small>
            <span className="event-carousel__cta">자세히 보기 →</span>
          </div>
        </Link>

        {total > 1 && (
          <>
            <button
              type="button"
              className="event-carousel__nav event-carousel__nav--prev"
              onClick={() => setIdx((p) => (p - 1 + total) % total)}
              aria-label={`이전 이벤트 — ${idx + 1}/${total}`}
            >
              ‹
            </button>
            <button
              type="button"
              className="event-carousel__nav event-carousel__nav--next"
              onClick={() => setIdx((p) => (p + 1) % total)}
              aria-label={`다음 이벤트 — ${idx + 1}/${total}`}
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="event-carousel__dots" role="tablist" aria-label="이벤트 선택">
          {eventBanners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`${i + 1}번 이벤트 — ${b.title}`}
              className={`event-carousel__dot${i === idx ? " is-active" : ""}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
