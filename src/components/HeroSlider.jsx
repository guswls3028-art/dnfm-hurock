"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners as fallbackHeroBanners } from "@/lib/content";
import { API_BASE, heroBanners as bannersApi } from "@/lib/api-client";
import BannerAdminFab from "@/components/BannerAdminFab";

const ROTATE_MS = 5000;

function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
}

function mapApiBannerToSlide(b) {
  return {
    id: `api-${b.id}`,
    kind: "wide",
    title: b.label || "",
    subtitle: "",
    src: resolveImageUrl(b.imageUrl),
    alt: b.label || "배너",
    href: b.linkUrl || "#",
    _api: true,
  };
}

/**
 * HeroSlider — 최상단 슬라이딩 배너. wide / wide-text 슬라이드만 지원.
 *  - kind === "wide": 이미지 기반 배너 (백엔드 hero_banners 또는 content.js fallback).
 *  - kind === "wide-text": 이미지 없이 emoji + 제목/부제 + cta. 콘테스트 / 이벤트 강조용.
 *  - 5초 자동 회전 (hover/focus 시 일시정지).
 *  - 좌상단 N/total, 우상단 톱니바퀴, 좌우 화살표 + 도트.
 */
export default function HeroSlider() {
  // 코드 고정 슬라이드 = content.js wide-text (콘테스트/이벤트 강조 슬라이드)
  const fixedSlides = fallbackHeroBanners.filter((b) => b.kind === "wide-text");
  const fallbackWide = fallbackHeroBanners.filter((b) => b.kind === "wide");

  const [apiWide, setApiWide] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await bannersApi.list();
        if (!alive) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        const filtered = items
          .filter((b) => b.active !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map(mapApiBannerToSlide)
          .filter((s) => !!s.src);
        setApiWide(filtered);
      } catch {
        if (!alive) return;
        setApiWide([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [reloadTick]);

  const wideSlides = apiWide && apiWide.length > 0 ? apiWide : fallbackWide;
  const banners = [...fixedSlides, ...wideSlides];

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

  useEffect(() => {
    if (idx >= banners.length && banners.length > 0) {
      setIdx(banners.length - 1);
    }
  }, [banners.length, idx]);

  if (!banners.length) {
    return <BannerAdminFab onChanged={() => setReloadTick((t) => t + 1)} />;
  }
  const total = banners.length;

  return (
    <>
      <section
        className="hero-slider"
        aria-label="주요 배너"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="hero-slider__track" aria-live="polite">
          {banners.map((b, i) => {
            const isActive = i === idx;
            const slideCls = `hero-slider__slide hero-slider__slide--${b.kind || "wide"}${
              isActive ? " is-active" : ""
            }`;
            const isInternal = b.href?.startsWith("/");

            // wide-text: 이미지 없는 카드형 슬라이드 (emoji + title + subtitle + cta)
            if (b.kind === "wide-text") {
              const tone = b.accentTone || "pink";
              return (
                <a
                  key={b.id}
                  href={b.href}
                  target={isInternal ? "_self" : "_blank"}
                  rel={isInternal ? undefined : "noreferrer"}
                  className={`${slideCls} hero-slider__slide--tone-${tone}`}
                  aria-hidden={isActive ? undefined : true}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${b.title} — ${b.subtitle}`}
                >
                  <span className="hero-slider__wide-text-emoji" aria-hidden="true">
                    {b.emoji}
                  </span>
                  <div className="hero-slider__wide-text-copy">
                    <strong>{b.title}</strong>
                    <small>{b.subtitle}</small>
                    {b.cta && (
                      <span className="hero-slider__wide-text-cta" aria-hidden="true">
                        {b.cta} →
                      </span>
                    )}
                  </div>
                </a>
              );
            }

            // wide: 이미지 기반 일반 배너
            return (
              <a
                key={b.id}
                href={b.href}
                target={isInternal ? "_self" : "_blank"}
                rel={isInternal ? undefined : "noreferrer"}
                className={slideCls}
                aria-hidden={isActive ? undefined : true}
                tabIndex={isActive ? 0 : -1}
                aria-label={`${b.title} — ${b.subtitle}`}
              >
                <Image
                  src={b.src}
                  alt={b.alt || b.title}
                  width={2320}
                  height={464}
                  priority={i === 0}
                  unoptimized
                  className="hero-slider__img"
                />
                <span className="hero-slider__hint" aria-hidden="true">
                  {b.title} →
                </span>
              </a>
            );
          })}
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
            <div
              className="hero-slider__dots"
              role="tablist"
              aria-label="배너 선택"
            >
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

      <BannerAdminFab onChanged={() => setReloadTick((t) => t + 1)} />
    </>
  );
}
