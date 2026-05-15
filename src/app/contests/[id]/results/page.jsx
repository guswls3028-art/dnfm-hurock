"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { contests as contestsApi } from "@/lib/api-client";

export default function ContestResultsPage({ params }) {
  const { id } = use(params);
  const [contest, setContest] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) setContest(detail.contest || detail);
      } catch {
        if (alive) setContest(null);
      }
      try {
        const data = await contestsApi.results(id);
        if (!alive) return;
        if (data && (data.podium || data.results)) {
          setResult(data);
        }
      } catch {
        if (alive) setResult(null);
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!contest && !loading) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <h1>콘테스트를 찾을 수 없습니다</h1>
        </div>
        <Link href="/contests" className="btn btn-primary">목록</Link>
      </PageShell>
    );
  }
  if (!contest) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <h1>로딩 중…</h1>
        </div>
      </PageShell>
    );
  }

  const podium = result?.podium || result?.results || [];

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href={`/contests/${contest.id}`}
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← {contest.title}
          </Link>
          <h1>
            🏆 결과 발표{" "}
            <StickerBadge
              tone={podium.length ? "amber" : "ink"}
              rotate="r"
            >
              {podium.length ? "발표완료" : "발표 전"}
            </StickerBadge>
          </h1>
          <p>{contest.resultsAt || ""}</p>
        </div>
      </div>

      {!podium.length ? (
        <div className="callout-box is-pending">
          <strong>아직 결과 발표 전</strong>
          허락이 후보 선정 / 투표 마감 후 결과를 입력하면 여기에 표시됩니다.
        </div>
      ) : (
        <>
          <div className="podium">
            {[2, 1, 3].map((rank) => {
              const item = podium.find((p) => p.rank === rank);
              if (!item) return <div key={rank} />;
              return (
                <div key={rank} className="podium-step" data-rank={rank}>
                  <div className="podium-rank">{rank}</div>
                  <strong>{item.name || item.title}</strong>
                  <span>by {item.by || item.displayName || item.author}</span>
                </div>
              );
            })}
          </div>

          <section className="section" aria-labelledby="result-comments">
            <div className="section-head">
              <h2 id="result-comments">코멘트</h2>
            </div>
            <div className="grid">
              {podium.map((p) => (
                <article
                  key={p.rank}
                  className={`card card-tone-${p.rank === 1 ? "amber" : p.rank === 2 ? "cyan" : "pink"}`}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StickerBadge
                      tone={p.rank === 1 ? "amber" : p.rank === 2 ? "cyan" : "pink"}
                      rotate="l"
                    >
                      {p.rank}등
                    </StickerBadge>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                      {p.name || p.title}
                    </strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
                      · by {p.by || p.displayName || p.author}
                    </span>
                  </div>
                  <p>{p.comment}</p>
                </article>
              ))}
            </div>
          </section>

          {result?.note && (
            <div className="callout-box" style={{ marginTop: 14 }}>
              {result.note}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
