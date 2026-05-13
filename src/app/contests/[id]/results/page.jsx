import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { contestResults, contests } from "@/lib/content";

export const metadata = { title: "콘테스트 결과" };

export default async function ContestResultsPage({ params }) {
  const { id } = await params;
  const contest = contests.find((c) => c.id === id);
  if (!contest) notFound();

  const result = contestResults[contest.id];

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href={`/contests/${contest.id}`}
            style={{ display: "inline-block", marginBottom: 8, borderBottom: "2px solid var(--ink)", fontSize: "0.84rem", fontWeight: 800 }}
          >
            ← {contest.title}
          </Link>
          <h1>
            🏆 결과 발표 <StickerBadge tone="amber" rotate="r">발표완료</StickerBadge>
          </h1>
          <p>{contest.resultsAt}</p>
        </div>
      </div>

      {!result ? (
        <div className="callout-box is-pending">
          <strong>아직 결과 발표 전</strong>
          허락이 후보 선정 / 투표 마감 후 결과를 입력하면 여기에 표시됩니다.
        </div>
      ) : (
        <>
          <div className="podium">
            {[2, 1, 3].map((rank) => {
              const item = result.podium.find((p) => p.rank === rank);
              if (!item) return <div key={rank} />;
              return (
                <div key={rank} className="podium-step" data-rank={rank}>
                  <div className="podium-rank">{rank}</div>
                  <strong>{item.name}</strong>
                  <span>by {item.by}</span>
                </div>
              );
            })}
          </div>

          <section className="section" aria-labelledby="result-comments">
            <div className="section-head">
              <h2 id="result-comments">코멘트</h2>
            </div>
            <div className="grid">
              {result.podium.map((p) => (
                <article key={p.rank} className={`card card-tone-${p.rank === 1 ? "amber" : p.rank === 2 ? "cyan" : "pink"}`}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StickerBadge tone={p.rank === 1 ? "amber" : p.rank === 2 ? "cyan" : "pink"} rotate="l">
                      {p.rank}등
                    </StickerBadge>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{p.name}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.84rem" }}>· by {p.by}</span>
                  </div>
                  <p>{p.comment}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="callout-box" style={{ marginTop: 14 }}>
            {result.note}
          </div>
        </>
      )}
    </PageShell>
  );
}
