import Image from "next/image";
import { platforms } from "@/lib/content";

const PLATFORM_BY_ID = platforms.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

/**
 * LiveCard — 라이브 / VOD 카드.
 *  - state: "live" | "scheduled" | "vod"
 *  - meta: 부가정보 chip
 *  - cta: { label, url, reason }
 *  - platformId: 썸네일에 플랫폼 아이콘 (SOOP / 치지직 / 유튜브)
 *
 * url=null 이면 disabled 버튼.
 */
export default function LiveCard({ card }) {
  const stateLabel =
    card.state === "live" ? "방송중" : card.state === "vod" ? "다시보기" : "예정";

  const platform = card.platformId ? PLATFORM_BY_ID[card.platformId] : null;

  return (
    <article className="live-card">
      <div
        className={`live-card-thumb${platform ? " has-platform" : ""}`}
        data-state={card.state}
        data-platform={card.platformId || undefined}
      >
        {platform?.iconSrc ? (
          <Image
            src={platform.iconSrc}
            alt={platform.iconAlt || platform.label}
            width={56}
            height={56}
            unoptimized
          />
        ) : null}
      </div>
      <div className="live-card-body">
        <strong>{card.title}</strong>
        <p>{card.body}</p>
        <div className="live-card-meta">
          <span>{stateLabel}</span>
          {card.meta?.map((m) => (
            <span key={m}>· {m}</span>
          ))}
        </div>
        {card.cta &&
          (card.cta.url ? (
            <a
              className="btn btn-sm btn-primary"
              style={{ marginTop: 6, alignSelf: "flex-start" }}
              href={card.cta.url}
              target="_blank"
              rel="noreferrer"
            >
              {card.cta.label}
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-sm is-disabled"
              style={{ marginTop: 6, alignSelf: "flex-start" }}
              disabled
              title={card.cta.reason}
            >
              {card.cta.label}
              <span className="btn-note">({card.cta.reason})</span>
            </button>
          ))}
      </div>
    </article>
  );
}
