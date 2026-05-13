"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import ContestEntryCard from "@/components/ContestEntryCard";
import StickerBadge from "@/components/StickerBadge";
import { contestEntries as mockEntries, contests as mockContests } from "@/lib/content";
import { contests as contestsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATUS_TONE = {
  submission: "pink",
  voting: "cyan",
  ended: "ink",
  announced: "amber",
};

export default function ContestDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useCurrentUser();
  const userIsAdmin = isAdmin(user, "allow");
  const [contest, setContest] = useState(() => mockContests.find((c) => c.id === id) || null);
  const [entries, setEntries] = useState(() => mockEntries[id] || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) {
          setContest(detail.contest || detail);
          setUsingMock(false);
        }
      } catch (err) {
        if (!contest) setError(err);
      }
      try {
        const data = await contestsApi.entries.list(id);
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.entries || [];
        if (list.length) {
          setEntries(list);
        }
      } catch {
        /* mock 유지 */
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!contest && !loading) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <div>
            <h1>콘테스트를 찾을 수 없습니다</h1>
            <p>{error?.message || "ID 가 잘못되었거나 삭제되었습니다."}</p>
          </div>
        </div>
        <Link href="/contests" className="btn btn-primary">콘테스트 목록</Link>
      </PageShell>
    );
  }
  if (!contest) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <div>
            <h1>로딩 중…</h1>
          </div>
        </div>
      </PageShell>
    );
  }

  const submissionOpen = contest.status === "submission";
  const voteOpen = contest.status === "voting";
  const announced = contest.status === "announced";

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href="/contests"
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← 콘테스트 목록
          </Link>
          <h1>
            {contest.posterEmoji ? `${contest.posterEmoji} ` : ""}
            {contest.title}
          </h1>
          <p>{contest.subtitle}</p>
        </div>
        <StickerBadge tone={STATUS_TONE[contest.status] || "amber"} rotate="r">
          {contest.statusLabel || contest.status}
        </StickerBadge>
      </div>

      <div className="contest-banner">
        <div className="contest-banner-body">
          <strong>{contest.title}</strong>
          <small>
            마감 {contest.submissionCloses || "-"} · 투표 {contest.voteWindow || "-"} ·{" "}
            {contest.resultsAt || ""}
          </small>
        </div>
        <div className="contest-banner-actions">
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
          {userIsAdmin && !usingMock ? (
            <Link
              className="btn btn-sm btn-admin"
              href={`/admin/contests/${contest.id}`}
              title="콘테스트 운영 — 참가작 심사 / 결과 입력"
            >
              🛡️ 어드민 도구로 이동 →
            </Link>
          ) : null}
        </div>
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
            {Array.isArray(contest.rewards) && contest.rewards.length ? (
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "var(--ink-soft)" }}>
                {contest.rewards.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--muted)" }}>경품 정보가 아직 없습니다.</p>
            )}
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
          {submissionOpen && <Link href={`/contests/${contest.id}/new`}>지금 참가 →</Link>}
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
        {usingMock && (
          <small style={{ color: "var(--muted)", marginTop: 6, display: "inline-block" }}>
            * 백엔드 미가용 — 샘플 데이터 표시 중
          </small>
        )}
      </section>
    </PageShell>
  );
}
