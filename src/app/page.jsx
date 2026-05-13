"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import HeroSlider from "@/components/HeroSlider";
import QuickNotice from "@/components/QuickNotice";
import CommunityBoard from "@/components/CommunityBoard";
import EventCarousel from "@/components/EventCarousel";
import SiblingSiteCard from "@/components/SiblingSiteCard";
import ContestPopup from "@/components/ContestPopup";

/**
 * 홈 — 던파 공홈 레이어 차용 (B급 디자인 토큰은 유지).
 *
 *   ┌─ Hero Slider — 회전 배너 (허락 portrait + 카카오 오픈톡 wide 배너들)
 *   ├─ Quick Notice — 공지/업데이트 2줄 + 더 보기 ⌄
 *   ├─ Community+ — 4탭 게시판 (공지사항 / 이벤트 / 대회 / 자유)
 *   ├─ Event Carousel — 큰 이벤트 카드 슬라이딩 (열혈패스 류)
 *   ├─ 부가 진입 (지난 회차 기록 / 방송 게임 포탈)
 *   └─ 친구들 — 뉴비 훈련소 (dnfm.kr) cross-link
 */
export default function HomePage() {
  return (
    <PageShell activePath="/">
      <ContestPopup />
      <HeroSlider />
      <QuickNotice />
      <CommunityBoard />
      <EventCarousel />

      <section className="section home-extra-links" aria-label="부가 진입">
        <Link href="/events/history" className="btn btn-sm">
          🗂️ 지난 회차 기록
        </Link>
        <Link href="/play" className="btn btn-sm">
          🎰 방송 게임 포탈
        </Link>
      </section>

      <section className="section" aria-labelledby="home-sibling">
        <div className="section-head">
          <h2 id="home-sibling">친구들</h2>
        </div>
        <SiblingSiteCard />
      </section>
    </PageShell>
  );
}
