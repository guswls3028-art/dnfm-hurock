import Link from "next/link";
import PageShell from "@/components/PageShell";
import HeroBanner from "@/components/HeroBanner";
import LiveCard from "@/components/LiveCard";
import ContestCard from "@/components/ContestCard";
import StickerBadge from "@/components/StickerBadge";
import { contests, liveCards, noticeBoard, siblingSite } from "@/lib/content";

export const metadata = {
  title: "허락"
};

export default function HomePage() {
  const featuredContests = contests.slice(0, 3);

  return (
    <PageShell activePath="/">
      <HeroBanner />

      <section className="section" aria-labelledby="home-live">
        <div className="section-head">
          <h2 id="home-live">
            방송 카드 <StickerBadge tone="pink" rotate="r">LIVE</StickerBadge>
          </h2>
          <Link href="/profile">내 페이지 →</Link>
        </div>
        <div className="grid grid-2">
          {liveCards.map((card) => (
            <LiveCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-contest">
        <div className="section-head">
          <h2 id="home-contest">
            진행중 콘테스트 <StickerBadge tone="cyan">참여 환영</StickerBadge>
          </h2>
          <Link href="/contests">전체 보기 →</Link>
        </div>
        <div className="grid grid-3">
          {featuredContests.map((c, i) => (
            <ContestCard key={c.id} contest={c} tilt={i % 2 === 0 ? "l" : "r"} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-notice">
        <div className="section-head">
          <h2 id="home-notice">최신 공지</h2>
          <Link href="/board">허락방 →</Link>
        </div>
        <div className="grid grid-2">
          {noticeBoard.map((n) => (
            <article key={n.id} className="card" data-tilt={n.pinned ? "l" : undefined}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {n.pinned && (
                  <StickerBadge tone="pink" rotate="l">
                    고정
                  </StickerBadge>
                )}
                <StickerBadge tone="cyan" rotate="0">
                  {n.posted}
                </StickerBadge>
              </div>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-sibling">
        <div className="section-head">
          <h2 id="home-sibling">자매 사이트</h2>
        </div>
        <article className="card card-tone-lime" data-tilt="r">
          <h3>↗ {siblingSite.label}</h3>
          <p>{siblingSite.note}</p>
          <div className="card-actions">
            <a className="btn btn-sm btn-accent" href={siblingSite.href} target="_blank" rel="noreferrer">
              dnfm.kr 가기
            </a>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
