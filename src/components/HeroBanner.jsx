import Link from "next/link";
import { hero, host } from "@/lib/content";
import StickerBadge from "@/components/StickerBadge";

/**
 * HeroBanner — B급 톤 hero.
 *  - 좌측: kicker sticker + 헤드라인(mark/strike segment) + body + actions
 *  - 우측: 살짝 기울어진 portrait placeholder (사진 등록 자리)
 *  - 배경: 노랑/시안 radial + ALLOW! outline 거대 텍스트
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
            const toneCls =
              action.tone === "accent"
                ? "btn-accent"
                : action.tone === "cyan"
                ? "btn-cyan"
                : "btn-primary";
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
          <div className="allow-hero-portrait-avatar" />
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
