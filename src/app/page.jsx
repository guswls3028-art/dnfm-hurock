"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import HeroBanner from "@/components/HeroBanner";
import LiveCard from "@/components/LiveCard";
import ContestCard from "@/components/ContestCard";
import StickerBadge from "@/components/StickerBadge";
import SiblingSiteCard from "@/components/SiblingSiteCard";
import { ApiError, posts as postsApi, contests as contestsApi } from "@/lib/api-client";
import {
  contests as mockContests,
  liveCards,
  noticeBoard,
  boardPosts as mockBoardPosts,
} from "@/lib/content";

const TARGET_FEATURED = "submission";

export default function HomePage() {
  const [contests, setContests] = useState(mockContests);
  const [boardPosts, setBoardPosts] = useState(mockBoardPosts);
  const [usingMock, setUsingMock] = useState({ contests: true, posts: true });

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
        if (!(err instanceof ApiError) || err.status === 0) {
          // 백엔드 미가용 — mock 유지
        }
      }
    })();
    (async () => {
      try {
        const data = await postsApi.list();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.posts || [];
        if (list.length) {
          setBoardPosts(list);
          setUsingMock((m) => ({ ...m, posts: false }));
        }
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 진행중 콘테스트 1개 + 그 외 카드들
  const submission = contests.find((c) => c.status === TARGET_FEATURED);
  const featuredContests = [submission, ...contests.filter((c) => c !== submission)]
    .filter(Boolean)
    .slice(0, 3);

  const latestPosts = boardPosts.slice(0, 3);

  return (
    <PageShell activePath="/">
      <HeroBanner />

      <section className="section" aria-labelledby="home-live">
        <div className="section-head">
          <h2 id="home-live">
            방송 채널 <StickerBadge tone="pink" rotate="r">LIVE / VOD</StickerBadge>
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
        {submission ? (
          <div className="contest-banner" style={{ marginBottom: 14 }}>
            <div className="contest-banner-body">
              <strong>
                {submission.posterEmoji ? `${submission.posterEmoji} ` : ""}
                {submission.title}
              </strong>
              <small>
                마감 {submission.submissionCloses} · 투표 {submission.voteWindow} · 참가 {submission.entries ?? 0}명
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
      </section>

      <section className="section" aria-labelledby="home-board">
        <div className="section-head">
          <h2 id="home-board">최신 게시판</h2>
          <Link href="/board">허락방 →</Link>
        </div>
        <div className="board-list" role="table" aria-label="최신 글">
          <div className="board-row is-head" role="row">
            <span>카테고리</span>
            <span>제목</span>
            <span>작성자</span>
            <span>날짜</span>
            <span>조회</span>
          </div>
          {latestPosts.map((p) => (
            <Link href={`/board/${p.id}`} key={p.id} className="board-row" role="row">
              <span className="board-row-cat">{p.category}</span>
              <span className="board-row-title">
                {p.title}
                {p.comments ? ` [${typeof p.comments === "number" ? p.comments : p.comments.length || 0}]` : ""}
              </span>
              <span className="board-row-meta">{p.author || p.displayName || "익명"}</span>
              <span className="board-row-meta">{p.date || ""}</span>
              <span className="board-row-meta">{p.views ?? "-"}</span>
            </Link>
          ))}
        </div>
        {usingMock.posts && (
          <small style={{ color: "var(--muted)", marginTop: 6, display: "inline-block" }}>
            * 백엔드 미가용 — 샘플 데이터 표시 중
          </small>
        )}
      </section>

      <section className="section" aria-labelledby="home-notice">
        <div className="section-head">
          <h2 id="home-notice">공지</h2>
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
          <h2 id="home-sibling">친구들</h2>
        </div>
        <SiblingSiteCard />
      </section>
    </PageShell>
  );
}
