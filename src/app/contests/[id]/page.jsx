import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import ContestEntryCard from "@/components/ContestEntryCard";
import StickerBadge from "@/components/StickerBadge";
import { contestEntries, contests } from "@/lib/content";

export const metadata = { title: "콘테스트 상세" };

const STATUS_TONE = {
  submission: "pink",
  voting: "cyan",
  ended: "ink",
  announced: "amber"
};

export default async function ContestDetailPage({ params }) {
  const { id } = await params;
  const contest = contests.find((c) => c.id === id);
  if (!contest) notFound();

  const entries = contestEntries[contest.id] || [];
  const submissionOpen = contest.status === "submission";
  const voteOpen = contest.status === "voting";
  const announced = contest.status === "announced";

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href="/contests"
            style={{ display: "inline-block", marginBottom: 8, borderBottom: "2px solid var(--ink)", fontSize: "0.84rem", fontWeight: 800 }}
          >
            ← 콘테스트 목록
          </Link>
          <h1>
            {contest.posterEmoji} {contest.title}
          </h1>
          <p>{contest.subtitle}</p>
        </div>
        <StickerBadge tone={STATUS_TONE[contest.status] || "amber"} rotate="r">
          {contest.statusLabel}
        </StickerBadge>
      </div>

      <div className="contest-banner">
        <div className="contest-banner-body">
          <strong>{contest.title}</strong>
          <small>
            마감 {contest.submissionCloses} · 투표 {contest.voteWindow} · {contest.resultsAt}
          </small>
        </div>
        {submissionOpen && (
          <Link className="btn btn-primary" href={`/contests/${contest.id}/new`}>
            지금 참가
          </Link>
        )}
        {voteOpen && (
          <Link className="btn btn-cyan" href={`/contests/${contest.id}/vote`}>
            투표하러 가기
          </Link>
        )}
        {announced && (
          <Link className="btn btn-accent" href={`/contests/${contest.id}/results`}>
            결과 보기
          </Link>
        )}
      </div>

      <section className="section" aria-labelledby="contest-desc">
        <div className="section-head">
          <h2 id="contest-desc">콘테스트 안내</h2>
        </div>
        <div className="grid grid-2">
          <article className="card card-tone-pink">
            <h3>설명</h3>
            <p>{contest.description}</p>
          </article>
          <article className="card card-tone-amber">
            <h3>경품 / 보상</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              {contest.rewards.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="contest-entries">
        <div className="section-head">
          <h2 id="contest-entries">
            참가작 ({entries.length}){" "}
            {submissionOpen && (
              <span style={{ color: "var(--muted)", fontSize: "0.86rem", fontWeight: 800 }}>
                · 마감 전엔 일부만 미리보기
              </span>
            )}
          </h2>
          {submissionOpen && (
            <Link href={`/contests/${contest.id}/new`}>지금 참가 →</Link>
          )}
        </div>
        {entries.length === 0 ? (
          <div className="callout-box">아직 참가작이 없습니다. 첫 번째가 되어 보세요!</div>
        ) : (
          <div className="grid grid-3">
            {entries.map((entry) => (
              <ContestEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
