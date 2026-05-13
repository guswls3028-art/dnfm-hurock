"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import HeroSlider from "@/components/HeroSlider";
import HeroBanner from "@/components/HeroBanner";
import BoardEntryGrid from "@/components/BoardEntryGrid";
import ContestCard from "@/components/ContestCard";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { contests as mockContests, noticeBoard } from "@/lib/content";

const TARGET_FEATURED = "submission";

export default function HomePage() {
  const [contests, setContests] = useState(mockContests);
  const [usingMock, setUsingMock] = useState({ contests: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await contestsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.contests || [];
        if (list.length) {
          setContests(list);
          setUsingMock((m) => ({ ...m, contests: false }));
        }
      } catch (err) {
        if (!(err instanceof ApiError) || err.status === 0) { /* mock */ }
      }
    })();
    return () => { alive = false; };
  }, []);

  const submission = contests.find((c) => c.status === TARGET_FEATURED);
  const featuredContests = [submission, ...contests.filter((c) => c !== submission)]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <PageShell activePath="/">
      <HeroSlider />
      <HeroBanner />

      <section className="section" aria-labelledby="home-notice">
        <div className="section-head">
          <h2 id="home-notice">
            공지 <StickerBadge tone="pink" rotate="r">필독</StickerBadge>
          </h2>
        </div>
        <div className="grid grid-2">
          {noticeBoard.map((n) => (
            <article key={n.id} className="card" data-tilt={n.pinned ? "l" : undefined}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {n.pinned && <StickerBadge tone="pink" rotate="l">고정</StickerBadge>}
                <StickerBadge tone="cyan" rotate="0">{n.posted}</StickerBadge>
              </div>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-entry">
        <div className="section-head">
          <h2 id="home-entry">
            게시판 <StickerBadge tone="cyan" rotate="r">5개 카테고리</StickerBadge>
          </h2>
          <Link href="/board">허락방 전체 →</Link>
        </div>
        <BoardEntryGrid />
      </section>

      <section className="section" aria-labelledby="home-contest">
        <div className="section-head">
          <h2 id="home-contest">
            이벤트 <StickerBadge tone="cyan">진행중 콘테스트</StickerBadge>
          </h2>
          <Link href="/events">이벤트 전체 →</Link>
        </div>
        {usingMock.contests ? (
          <div className="callout-box">
            <strong>곧 시작합니다</strong>
            아직 등록된 콘테스트가 없어요. 첫 콘테스트가 열리면 여기에 표시됩니다.
          </div>
        ) : (
          <>
            {submission ? (
              <div className="contest-banner" style={{ marginBottom: 14 }}>
                <div className="contest-banner-body">
                  <strong>
                    {submission.posterEmoji ? `${submission.posterEmoji} ` : ""}
                    {submission.title}
                  </strong>
                  <small>
                    {submission.eventAt ? `📅 ${submission.eventAt} · ` : ""}
                    마감 {submission.submissionCloses} · 참가 {submission.entries ?? 0}명
                  </small>
                </div>
                <Link href={`/contests/${submission.id}/new`} className="btn btn-primary">
                  지금 참가
                </Link>
              </div>
            ) : null}
            <div className="grid grid-3">
              {featuredContests.map((c, i) => (
                <ContestCard key={c.id} contest={c} tilt={i % 2 === 0 ? "l" : "r"} />
              ))}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}
