"use client";

import Image from "next/image";
import StickerBadge from "@/components/StickerBadge";
import { host, platforms } from "@/lib/content";

/**
 * HostBanner — 슬라이딩 배너 아래 고정 배치되는 허락 본인 배너.
 *  - 좌: 허락 portrait (오니 마스크) + 방송중 sticker
 *  - 우: 채널명 + 방송 시간 + 3개 플랫폼 아이콘 항상 노출
 */
export default function HostBanner() {
  return (
    <section className="host-banner" aria-label="허락 방송 채널">
      <div className="host-banner__portrait">
        <Image
          src={host.avatarSrc}
          alt={host.avatarAlt || host.name}
          width={500}
          height={500}
          priority
          unoptimized
        />
      </div>
      <div className="host-banner__copy">
        <div className="host-banner__title-row">
          <strong className="host-banner__title">{host.channelName}</strong>
          <StickerBadge tone="pink" rotate="r">방송러</StickerBadge>
        </div>
        <small className="host-banner__sub">{host.schedule?.summary}</small>
        <div
          className="host-banner__channels"
          role="group"
          aria-label="방송 채널 바로가기"
        >
          {platforms.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="host-banner__channel"
              aria-label={`${p.label} 새 창`}
              title={p.label}
            >
              <Image
                src={p.iconSrc}
                alt=""
                width={36}
                height={36}
                unoptimized
              />
              <span className="host-banner__channel-label">{p.iconAlt || p.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
