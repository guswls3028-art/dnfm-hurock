"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners } from "@/lib/content";

const ROTATE_MS = 5000;

/**
 * HeroSlider — 최상단 슬라이딩 배너 (던파 공홈 메인 슬라이더 레이어).
 *  - banner.kind === "portrait": 허락 본인 portrait + 사이드 텍스트 (왕대가리 슬라이드)
 *  - banner.kind === "wide": 카카오 오픈톡 배너 (가로 5:1 띠)
 *  - 자동 5초 회전 (hover/focus 시 일시정지)
 *  - 좌하단 N/total 인디케이터 (공홈 1/17 형식)
 *  - 좌우 화살표 + 도트
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
    timerRef.current = setTimeout(
      () => setIdx((p) => (p + 1) % banners.length),
      ROTATE_MS
    );
    return () => clearTimeout(timerRef.current);
  }, [idx, paused, banners.length]);

  if (!banners.length) return null;
  const total = banners.length;

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
            className={`hero-slider__slide hero-slider__slide--${b.kind || "wide"}${i === idx ? " is-active" : ""}`}
            aria-hidden={i === idx ? undefined : true}
            tabIndex={i === idx ? 0 : -1}
            aria-label={`${b.title} — ${b.subtitle}`}
          >
            {b.kind === "portrait" ? (
              <div className="hero-slider__portrait">
                <span className="hero-slider__portrait-avatar">
                  <Image
                    src={b.src}
                    alt={b.alt || b.title}
                    width={500}
                    height={500}
                    priority={i === 0}
                    unoptimized
                  />
                </span>
                <div className="hero-slider__portrait-copy">
                  <strong>{b.title}</strong>
                  <small>{b.subtitle}</small>
                  {b.cta && <span className="hero-slider__portrait-cta">{b.cta} →</span>}
                </div>
              </div>
            ) : (
              <Image
                src={b.src}
                alt={b.alt || b.title}
                width={2320}
                height={464}
                priority={i === 0}
                unoptimized
                className="hero-slider__img"
              />
            )}
            <span className="hero-slider__hint" aria-hidden="true">
              {b.title} →
            </span>
          </a>
        ))}
      </div>

      <span className="hero-slider__counter" aria-hidden="true">
        <strong>{idx + 1}</strong>/{total}
      </span>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--prev"
            onClick={prev}
            aria-label={`이전 배너 — 현재 ${idx + 1}/${total}`}
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--next"
            onClick={next}
            aria-label={`다음 배너 — 현재 ${idx + 1}/${total}`}
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
