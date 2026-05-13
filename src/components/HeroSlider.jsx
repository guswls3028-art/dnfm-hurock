"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners as fallbackHeroBanners } from "@/lib/content";
import { API_BASE, ApiError, heroBanners as bannersApi } from "@/lib/api-client";
import BannerAdminFab from "@/components/BannerAdminFab";

const ROTATE_MS = 5000;

/**
 * imageUrl 이 path 면 API_BASE prefix, 절대 URL 이면 그대로.
 */
function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
}

/**
 * backend hero_banners row → frontend slide schema 변환.
 */
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
 * HeroSlider — 최상단 슬라이딩 배너 (던파 공홈 메인 슬라이더 레이어).
 *  - banner.kind === "portrait": 허락 본인 portrait + 사이드 텍스트 (왕대가리 슬라이드)
 *    → 사이트 identity 라 코드 고정. content.js 에서 가져옴.
 *  - banner.kind === "wide": 카카오 오픈톡 배너 등.
 *    → backend hero_banners 도메인 (active=true) 가 있으면 그것이 우선. 없으면 content.js fallback.
 *  - 자동 5초 회전 (hover/focus 시 일시정지)
 *  - 좌하단 N/total 인디케이터 (공홈 1/17 형식)
 *  - 좌우 화살표 + 도트
 *  - 우상단 톱니바퀴 fab (운영자만) — BannerAdminFab.
 */
export default function HeroSlider() {
  // portrait 고정 슬라이드 = content.js 의 portrait kind 만
  const fixedSlides = fallbackHeroBanners.filter((b) => b.kind === "portrait");
  const fallbackWide = fallbackHeroBanners.filter((b) => b.kind === "wide");

  const [apiWide, setApiWide] = useState(null); // null=로딩, []=비어있음, [...]=실데이터
  const [reloadTick, setReloadTick] = useState(0);

  // backend list fetch (public)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await bannersApi.list();
        if (!alive) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        // active=true 만, sortOrder asc
        const filtered = items
          .filter((b) => b.active !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map(mapApiBannerToSlide)
          .filter((s) => !!s.src);
        setApiWide(filtered);
      } catch (e) {
        // backend 미응답 시 fallback 으로
        if (!alive) return;
        setApiWide([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [reloadTick]);

  // wide 슬라이드 = API 우선, 비어있으면 content.js fallback
  const wideSlides =
    apiWide && apiWide.length > 0 ? apiWide : fallbackWide;
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

  // banners 길이 변화 시 idx clamp
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
          {banners.map((b, i) => (
            <a
              key={b.id}
              href={b.href}
              target={b.href?.startsWith("/") ? "_self" : "_blank"}
              rel={b.href?.startsWith("/") ? undefined : "noreferrer"}
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
                    {b.cta && (
                      <span className="hero-slider__portrait-cta">
                        {b.cta} →
                      </span>
                    )}
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

      {/* 운영자 톱니바퀴 — fab → drawer. onChanged 시 API 재조회. */}
      <BannerAdminFab onChanged={() => setReloadTick((t) => t + 1)} />
    </>
  );
}
