"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATE_TONE = {
  pending: "amber",
  candidate: "lime",
  rejected: "pink",
};

const STATE_LABEL = {
  pending: "검수 대기",
  candidate: "후보 선정",
  rejected: "반려",
};

export default function AdminContestDetailPage({ params }) {
  const { id } = use(params);
  const { user, loading: userLoading } = useCurrentUser();

  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [resultBusy, setResultBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [detailLoaded, setDetailLoaded] = useState(false);
  const [resultForm, setResultForm] = useState([
    { rank: 1, entryId: "", comment: "" },
    { rank: 2, entryId: "", comment: "" },
    { rank: 3, entryId: "", comment: "" },
  ]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) setContest(detail.contest || detail);
      } catch (err) {
        if (alive) setError(err instanceof ApiError ? err : { message: err?.message || "콘테스트 조회 실패" });
      } finally {
        if (alive) setDetailLoaded(true);
      }
      try {
        const data = await contestsApi.entries.list(id);
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || data?.entries || [];
        setEntries(list);
      } catch {
        /* fetch 실패 — 빈 상태 유지 */
      } finally {
        if (alive) setEntriesLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function toggleCandidate(entryId, currentlySelected) {
    setError(null);
    try {
      await contestsApi.entries.select(id, entryId, { selectedForVote: !currentlySelected });
      setEntries((es) =>
        es.map((e) =>
          e.id === entryId
            ? {
                ...e,
                selectedForVote: !currentlySelected,
                state: !currentlySelected ? "candidate" : "pending",
              }
            : e,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err : { message: err?.message || "실패" });
    }
  }

  async function changeStatus(nextStatus) {
    setStatusBusy(true);
    setError(null);
    setSuccess(null);
    try {
      // backend 는 별도 status endpoint 없이 PATCH /contests/:id 로 받음.
      await contestsApi.update(id, { status: nextStatus });
      setContest((c) => (c ? { ...c, status: nextStatus, statusLabel: labelFor(nextStatus) } : c));
      setSuccess(`상태가 "${labelFor(nextStatus)}" 로 변경되었습니다.`);
    } catch (err) {
      setError(err instanceof ApiError ? err : { message: err?.message || "상태 변경 실패" });
    } finally {
      setStatusBusy(false);
    }
  }

  function setResultField(rank, key, val) {
    setResultForm((rs) => rs.map((r) => (r.rank === rank ? { ...r, [key]: val } : r)));
  }

  async function publishResult() {
    setResultBusy(true);
    setError(null);
    setSuccess(null);
    try {
      // backend announceResultsDto: { auto?, rankings: [{entryId, rank, note?}] }
      const rankings = resultForm
        .filter((r) => r.entryId)
        .map((r) => ({ rank: r.rank, entryId: r.entryId, note: r.comment || undefined }));
      if (!rankings.length) throw new Error("최소 1등 entry 는 선택해야 합니다.");
      await contestsApi.announceResults(id, { rankings });
      setSuccess("결과를 발표했습니다. 결과 페이지에 노출됩니다.");
    } catch (err) {
      setError(err instanceof ApiError ? err : { message: err?.message || "발표 실패" });
    } finally {
      setResultBusy(false);
    }
  }

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <h1>로그인이 필요합니다</h1>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/admin/contests/${id}`)}`}
          className="btn btn-primary"
        >
          로그인
        </Link>
      </PageShell>
    );
  }
  if (!userLoading && user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <h1>접근 권한이 없습니다 (403)</h1>
        </div>
        <Link href="/" className="btn">홈으로</Link>
      </PageShell>
    );
  }
  if (!contest) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>{detailLoaded ? "콘테스트를 찾을 수 없습니다" : "로딩 중…"}</h1>
            {detailLoaded ? <p>관리 페이지를 열 수 없어요.</p> : null}
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
            <Link href="/admin" className="btn btn-primary">
              어드민 홈
            </Link>
          </>
        ) : null}
      </PageShell>
    );
  }

  const candidateEntries = entries.filter((e) => e.selectedForVote || e.state === "candidate");

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <Link
            href="/admin"
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← 어드민
          </Link>
          <h1>{contest.title}</h1>
          <p>
            상태: <strong>{contest.statusLabel || contest.status}</strong> · 참가{" "}
            {entries.length}명 · 마감 {contest.submissionCloses || "-"}
          </p>
        </div>
        <StickerBadge tone="cyan" rotate="r">
          심사 모드
        </StickerBadge>
      </div>

      <section className="admin-toolbar" aria-label="콘테스트 상태 전환">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => changeStatus("open")}
          disabled={statusBusy || contest.status === "open"}
        >
          단계: 참가 모집
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => changeStatus("judging")}
          disabled={statusBusy || contest.status === "judging"}
        >
          → 후보 심사
        </button>
        <button
          type="button"
          className="btn btn-sm btn-cyan"
          onClick={() => changeStatus("voting")}
          disabled={statusBusy || contest.status === "voting"}
        >
          → 투표 시작
        </button>
        <button
          type="button"
          className="btn btn-sm btn-accent"
          onClick={() => changeStatus("completed")}
          disabled={statusBusy || contest.status === "completed"}
        >
          → 결과 발표
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => changeStatus("draft")}
          disabled={statusBusy || contest.status === "draft"}
        >
          임시저장
        </button>
      </section>

      {error && (
        <div className="callout-box is-pending" style={{ marginTop: 12 }}>
          <strong>실패</strong>
          {error.message || "다시 시도해 주세요."}
        </div>
      )}
      {success && (
        <div className="callout-box" style={{ marginTop: 12 }}>
          <strong>완료</strong>
          {success}
        </div>
      )}

      <section className="section" aria-labelledby="admin-entries">
        <div className="section-head">
          <h2 id="admin-entries">참가작 심사</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.84rem", fontWeight: 800 }}>
            후보로 선정한 entry 만 시청자 투표에 노출됩니다
          </span>
        </div>
        {entriesLoaded && entries.length === 0 && (
          <div className="callout-box" style={{ marginBottom: 12 }}>
            <strong>참가작 없음</strong>
            아직 참가한 사람이 없어요. 참가 시작 후 entry 가 들어오면 여기에 표시됩니다.
          </div>
        )}

        <div className="board-list">
          <div
            className="board-row is-head"
            style={{ gridTemplateColumns: "90px minmax(0,1fr) 160px 130px 160px" }}
          >
            <span>상태</span>
            <span>제목 / 캐릭터</span>
            <span>모험단</span>
            <span>actions</span>
            <span>비고</span>
          </div>
          {entries.map((e) => {
            const isCandidate = e.selectedForVote || e.state === "candidate";
            const state = isCandidate ? "candidate" : (e.state || "pending");
            return (
              <div
                key={e.id}
                className="board-row"
                style={{ gridTemplateColumns: "90px minmax(0,1fr) 160px 130px 160px" }}
              >
                <span>
                  <StickerBadge tone={STATE_TONE[state] || "amber"} rotate="0">
                    {STATE_LABEL[state] || state}
                  </StickerBadge>
                </span>
                <span className="board-row-title">
                  {e.title}{" "}
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                    · {e.characterName || "(N/A)"}
                  </span>
                </span>
                <span className="board-row-meta">{e.adventureName || "-"}</span>
                <span style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isCandidate ? "btn-cyan" : ""}`}
                    onClick={() => toggleCandidate(e.id, isCandidate)}
                  >
                    {isCandidate ? "후보 취소" : "후보 선정"}
                  </button>
                </span>
                <span className="board-row-meta">{e.reason || "-"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="admin-result">
        <div className="section-head">
          <h2 id="admin-result">결과 입력</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.84rem", fontWeight: 800 }}>
            후보 중 선택 → 한 줄 코멘트
          </span>
        </div>
        <form
          className="form-block"
          onSubmit={(e) => {
            e.preventDefault();
            publishResult();
          }}
        >
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            투표 마감 후 1~3등 + 코멘트를 입력하면 결과 페이지에 자동 노출됩니다.
          </p>
          {[1, 2, 3].map((rank) => {
            const cur = resultForm.find((r) => r.rank === rank);
            return (
              <div key={rank} className="form-row">
                <label>{rank}등 — entry 선택 / 코멘트</label>
                <select
                  className="form-select"
                  value={cur?.entryId || ""}
                  onChange={(e) => setResultField(rank, "entryId", e.target.value)}
                >
                  <option value="">-- 후보 중 선택 --</option>
                  {candidateEntries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.characterName || "?"})
                    </option>
                  ))}
                </select>
                <input
                  className="form-input"
                  type="text"
                  value={cur?.comment || ""}
                  onChange={(e) => setResultField(rank, "comment", e.target.value)}
                  placeholder="허락이 직접 남기는 한 줄 코멘트"
                />
              </div>
            );
          })}
          <button type="submit" className="btn btn-primary" disabled={resultBusy}>
            {resultBusy ? "발표 처리중…" : "결과 발표"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}

function labelFor(status) {
  switch (status) {
    case "draft": return "임시저장";
    case "open": return "참가 모집중";
    case "judging": return "후보 심사중";
    case "voting": return "투표중";
    case "completed": return "결과 발표";
    default: return status;
  }
}
