import Link from "next/link";
import Image from "next/image";
import { hero, host, platforms } from "@/lib/content";
import StickerBadge from "@/components/StickerBadge";

const PLATFORM_BY_ID = platforms.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

function actionPlatform(action) {
  if (!action.url) return null;
  if (action.url.includes("sooplive")) return PLATFORM_BY_ID.soop;
  if (action.url.includes("chzzk")) return PLATFORM_BY_ID.chzzk;
  if (action.url.includes("youtube")) return PLATFORM_BY_ID.youtube;
  return null;
}

/**
 * HeroBanner — B급 톤 hero.
 *  - 좌측: kicker sticker + 헤드라인(mark/strike segment) + body + 액션
 *      · 플랫폼 액션(SOOP / 치지직 / 유튜브) = 아이콘 전용 동그란 버튼 (텍스트 X, aria-label 만)
 *      · 그 외 액션 = 텍스트 버튼
 *  - 우측: 살짝 기울어진 portrait + 허락 프사 (오니 마스크) + 빨강/노랑 ring frame
 */
export default function HeroBanner() {
  return (
    <section className="allow-hero" aria-labelledby="allow-hero-title">
      <div className="allow-hero-copy">
        <span className="allow-hero-kicker">{hero.kicker}</span>
        <h1 id="allow-hero-title">
          {hero.headlineSegments.map((seg, idx) => {
            const space = idx < hero.headlineSegments.length - 1 ? " " : "";
            if (seg.style === "mark") {
              return (
                <span key={idx}>
                  <span className="h-mark">{seg.text}</span>
                  {space}
                </span>
              );
            }
            if (seg.style === "strike") {
              return (
                <span key={idx}>
                  <span className="h-strike">{seg.text}</span>
                  {space}
                </span>
              );
            }
            return <span key={idx}>{seg.text + space}</span>;
          })}
        </h1>
        <p className="allow-hero-body">{hero.body}</p>
        <div className="allow-hero-actions">
          {hero.primaryActions.map((action) => {
            const platform = actionPlatform(action);
            const toneCls =
              action.tone === "accent"
                ? "btn-accent"
                : action.tone === "cyan"
                ? "btn-cyan"
                : "btn-primary";

            // 플랫폼 액션 = 아이콘 자체만 (컨테이너 X, 한글 라벨 X)
            if (platform) {
              const label = platform.iconAlt || platform.label || action.label;
              if (!action.url) {
                return (
                  <button
                    key={platform.id}
                    type="button"
                    className={`platform-action platform-action--${platform.id} is-disabled`}
                    disabled
                    aria-label={label}
                  >
                    <Image src={platform.iconSrc} alt="" width={64} height={64} unoptimized />
                  </button>
                );
              }
              return (
                <a
                  key={platform.id}
                  href={action.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`platform-action platform-action--${platform.id}`}
                  aria-label={label}
                >
                  <Image src={platform.iconSrc} alt="" width={64} height={64} unoptimized />
                </a>
              );
            }

            // 일반 텍스트 액션 (후원하기 등)
            if (!action.url) {
              return (
                <button
                  key={action.label}
                  type="button"
                  className={`btn ${toneCls} is-disabled`}
                  disabled
                  title={action.reason}
                >
                  {action.label}
                  <span className="btn-note">({action.reason})</span>
                </button>
              );
            }
            const isExternal = action.url.startsWith("http");
            const buttonEl = isExternal ? (
              <a
                href={action.url}
                target="_blank"
                rel="noreferrer"
                className={`btn ${toneCls}`}
              >
                {action.label}
              </a>
            ) : (
              <Link href={action.url} className={`btn ${toneCls}`}>
                {action.label}
              </Link>
            );
            if (action.note) {
              return (
                <span key={action.label} className="allow-hero-action-stack">
                  {buttonEl}
                  <StickerBadge tone="lime" rotate="r">
                    {action.note}
                  </StickerBadge>
                </span>
              );
            }
            return <span key={action.label}>{buttonEl}</span>;
          })}
        </div>
      </div>

      <div className="allow-hero-portrait" aria-hidden="false">
        <div className="allow-hero-portrait-inner">
          {host.avatarSrc ? (
            <span className="allow-hero-portrait-avatar has-image">
              <Image
                src={host.avatarSrc}
                alt={host.avatarAlt || host.name}
                width={500}
                height={500}
                priority
                unoptimized
              />
            </span>
          ) : (
            <span className="allow-hero-portrait-avatar" />
          )}
          <strong>{host.name}</strong>
          <small>{host.channelName} · {host.channelHandle}</small>
          <small style={{ opacity: 0.78 }}>{host.tagline}</small>
          <StickerBadge tone="pink" rotate="r">
            {hero.portraitNote || "방송 준비중"}
          </StickerBadge>
        </div>
      </div>
    </section>
  );
}
