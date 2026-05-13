import Image from "next/image";
import StickerBadge from "@/components/StickerBadge";

/**
 * OpenChatBanner — 카카오 오픈톡 입구 카드.
 *  - bannerSrc: 카카오 배너 원본 (가로 띠)
 *  - title/subtitle: 좌측 텍스트
 *  - tone: pink | cyan (sticker / hover 색)
 *  - tag: 우상단 sticker 라벨 (예: "고인물" / "뉴비")
 */
export default function OpenChatBanner({ chat, tilt = "l" }) {
  const tone = chat.tone === "cyan" ? "cyan" : "pink";
  return (
    <a
      href={chat.url}
      target="_blank"
      rel="noreferrer"
      className={`openchat-card openchat-card--${tone}`}
      data-tilt={tilt}
      aria-label={`${chat.title} 오픈톡 새창에서 열기`}
    >
      <div className="openchat-card__banner">
        <Image
          src={chat.bannerSrc}
          alt={chat.bannerAlt || chat.title}
          width={1200}
          height={200}
          unoptimized
        />
        {chat.tag ? (
          <span className="openchat-card__tag">
            <StickerBadge tone={tone} rotate={tilt === "l" ? "l" : "r"}>
              {chat.tag}
            </StickerBadge>
          </span>
        ) : null}
      </div>
      <div className="openchat-card__body">
        <strong>{chat.title}</strong>
        <p>{chat.subtitle}</p>
        <span className="openchat-card__cta">카카오톡으로 입장 →</span>
      </div>
    </a>
  );
}
