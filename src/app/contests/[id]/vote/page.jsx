"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import VoteCard from "@/components/VoteCard";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ContestVotePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [voted, setVoted] = useState(false);
  const [detailLoaded, setDetailLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) setContest(detail.contest || detail);
      } catch (err) {
        if (alive) setError({ message: err?.message || "콘테스트를 불러오지 못했습니다." });
      } finally {
        if (alive) setDetailLoaded(true);
      }
      try {
        const data = await contestsApi.entries.list(id);
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.entries || [];
        // 투표 단계에서는 selectedForVote=true 만 노출. 그 외엔 전체.
        const filtered = list.filter((e) => e.selectedForVote || e.state === "candidate" || e.selected_for_vote);
        setEntries(filtered.length ? filtered : list);
      } catch {
        if (alive) setEntries([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!contest) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <div>
            <h1>{detailLoaded ? "콘테스트를 찾을 수 없습니다" : "로딩 중…"}</h1>
            {detailLoaded ? <p>투표 페이지를 열 수 없어요.</p> : null}
          </div>
        </div>
        {detailLoaded ? (
          <>
            {error ? (
              <div className="callout-box is-pending">
                <strong>불러오기 실패</strong>
                {error.message || "다시 시도해 주세요."}
              </div>
            ) : null}
            <Link href="/contests" className="btn btn-primary">
              콘테스트 목록
            </Link>
          </>
        ) : null}
      </PageShell>
    );
  }

  const disabled = contest.status !== "voting";

  async function handleSubmit() {
    if (!selected) {
      setError({ message: "투표할 entry 를 선택해 주세요." });
      return;
    }
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/contests/${contest.id}/vote`)}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await contestsApi.vote(contest.id, { entryId: selected });
      setVoted(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      else setError({ message: err?.message || "투표 실패" });
    } finally {
      setSubmitting(false);
    }
  }

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
          <h1>투표하기</h1>
          <p>1인 1표. 마감 후 결과 페이지가 켜집니다.</p>
        </div>
        <StickerBadge tone={disabled ? "ink" : "cyan"} rotate="r">
          {disabled ? "투표 비활성" : "투표중"}
        </StickerBadge>
      </div>

      {disabled && (
        <div className="callout-box is-pending">
          <strong>아직/이미 투표 단계가 아닙니다</strong>
          {contest.title} 의 현재 상태는 <code>{contest.statusLabel || contest.status}</code> 입니다.
        </div>
      )}

      {!userLoading && !user && !disabled && (
        <div className="callout-box is-pending">
          <strong>로그인 필요</strong>
          1인 1표 검증을 위해 로그인이 필요합니다.{" "}
          <Link
            href={`/login?returnTo=${encodeURIComponent(`/contests/${contest.id}/vote`)}`}
            style={{
              borderBottom: "2px solid var(--primary)",
              fontWeight: 800,
              color: "var(--primary-ink)",
            }}
          >
            로그인 / 가입하기
          </Link>
        </div>
      )}

      {voted && (
        <div className="callout-box">
          <strong>투표 완료</strong>
          소중한 한 표 감사합니다. 결과는 마감 후 발표됩니다.
        </div>
      )}

      {entries.length === 0 ? (
        <div className="callout-box">투표할 참가작이 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-3">
            {entries.map((entry) => (
              <VoteCard
                key={entry.id}
                entry={entry}
                groupName={`vote-${contest.id}`}
                selected={selected === entry.id}
                onSelect={setSelected}
                disabled={disabled || voted}
              />
            ))}
          </div>
          {error && (
            <div className="callout-box is-pending" style={{ marginTop: 12 }}>
              <strong>오류</strong>
              {error.message || "다시 시도해 주세요."}
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={disabled || voted || submitting}
            >
              {submitting ? "투표 처리중…" : voted ? "투표 완료" : "투표 제출"}
            </button>
            <span style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
              {selected
                ? `선택: ${entries.find((e) => e.id === selected)?.title || ""}`
                : "아직 선택 안 함"}
            </span>
          </div>
        </>
      )}
    </PageShell>
  );
}
