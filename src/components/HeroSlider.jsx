"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners } from "@/lib/content";

const ROTATE_MS = 5000;

/**
 * HeroSlider — 최상단 슬라이딩 배너.
 *  - heroBanners 배열 자동 5초 회전
 *  - hover / 키보드 포커스 시 일시 정지
 *  - 좌우 화살표 + 도트 인디케이터 (수동 조작)
 *  - prefers-reduced-motion 존중 (자동 회전 끔)
 */
export default function HeroSlider() {
  const banners = heroBanners;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (next) => {
      const n = banners.length;
      if (!n) return;
      setIdx(((next % n) + n) % n);
    },
    [banners.length]
  );

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  useEffect(() => {
    if (paused || banners.length < 2) return undefined;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    timerRef.current = setTimeout(() => setIdx((p) => (p + 1) % banners.length), ROTATE_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, paused, banners.length]);

  if (!banners.length) return null;
  const current = banners[idx];

  return (
    <section
      className="hero-slider"
      aria-label="주요 배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero-slider__track" aria-live="polite">
        {banners.map((b, i) => (
          <a
            key={b.id}
            href={b.href}
            target="_blank"
            rel="noreferrer"
            className={`hero-slider__slide${i === idx ? " is-active" : ""}`}
            aria-hidden={i === idx ? undefined : true}
            tabIndex={i === idx ? 0 : -1}
            aria-label={`${b.title} — ${b.subtitle}`}
          >
            <Image
              src={b.src}
              alt={b.alt || b.title}
              width={1600}
              height={260}
              priority={i === 0}
              unoptimized
              className="hero-slider__img"
            />
            <span className="hero-slider__caption">
              <strong>{b.title}</strong>
              <small>{b.subtitle}</small>
            </span>
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--prev"
            onClick={prev}
            aria-label={`이전 배너 — 현재 ${idx + 1}/${banners.length}`}
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--next"
            onClick={next}
            aria-label={`다음 배너 — 현재 ${idx + 1}/${banners.length}`}
          >
            ›
          </button>
          <div className="hero-slider__dots" role="tablist" aria-label="배너 선택">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`${i + 1}번 배너 — ${b.title}`}
                className={`hero-slider__dot${i === idx ? " is-active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
