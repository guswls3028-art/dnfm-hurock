import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { adminContestDetail, contests } from "@/lib/content";

export const metadata = { title: "콘테스트 관리" };

const STATE_TONE = {
  pending: "amber",
  candidate: "lime",
  rejected: "pink"
};

export default async function AdminContestDetailPage({ params }) {
  const { id } = await params;
  const contest = contests.find((c) => c.id === id);
  if (!contest) notFound();

  // mock: 모든 콘테스트에서 동일 detail 사용 (UI 골격)
  const detail = adminContestDetail;

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <Link
            href="/admin"
            style={{ display: "inline-block", marginBottom: 8, borderBottom: "2px solid var(--ink)", fontSize: "0.84rem", fontWeight: 800 }}
          >
            ← 어드민
          </Link>
          <h1>{contest.title}</h1>
          <p>
            상태: <strong>{contest.statusLabel}</strong> · 참가 {contest.entries}명 · 마감 {contest.submissionCloses}
          </p>
        </div>
        <StickerBadge tone="cyan" rotate="r">
          심사 모드
        </StickerBadge>
      </div>

      <section className="admin-toolbar" aria-label="콘테스트 상태 전환">
        <button type="button" className="btn btn-sm">
          단계: 참가 모집
        </button>
        <button type="button" className="btn btn-sm btn-cyan">
          → 투표 시작
        </button>
        <button type="button" className="btn btn-sm">
          → 결과 발표
        </button>
        <button type="button" className="btn btn-sm btn-ghost is-disabled" disabled>
          종료/숨김 <span className="btn-note">(준비중)</span>
        </button>
      </section>

      <section className="section" aria-labelledby="admin-entries">
        <div className="section-head">
          <h2 id="admin-entries">참가작 심사</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.84rem", fontWeight: 800 }}>
            후보로 선정한 entry 만 시청자 투표에 노출됩니다
          </span>
        </div>

        <div className="board-list">
          <div className="board-row is-head" style={{ gridTemplateColumns: "70px minmax(0,1fr) 160px 100px 160px" }}>
            <span>상태</span>
            <span>제목 / 캐릭터</span>
            <span>모험단</span>
            <span>actions</span>
            <span>비고</span>
          </div>
          {detail.entries.map((e) => (
            <div
              key={e.id}
              className="board-row"
              style={{ gridTemplateColumns: "70px minmax(0,1fr) 160px 100px 160px" }}
            >
              <span>
                <StickerBadge tone={STATE_TONE[e.state] || "amber"} rotate="0">
                  {detail.stateLabel[e.state]}
                </StickerBadge>
              </span>
              <span className="board-row-title">
                {e.title} <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {e.characterName}</span>
              </span>
              <span className="board-row-meta">{e.adventureName}</span>
              <span style={{ display: "flex", gap: 4 }}>
                <button type="button" className="btn btn-sm">
                  보기
                </button>
              </span>
              <span className="board-row-meta">{e.reason || "-"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="admin-result">
        <div className="section-head">
          <h2 id="admin-result">결과 입력</h2>
        </div>
        <form className="form-block" action="#" method="post">
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            투표 마감 후 1~3등 + 코멘트를 입력하면 결과 페이지에 자동 노출됩니다.
          </p>
          {[1, 2, 3].map((rank) => (
            <div key={rank} className="form-row">
              <label>{rank}등 — entry 선택 / 코멘트</label>
              <select className="form-select" defaultValue="">
                <option value="">-- 후보 중 선택 --</option>
                {detail.entries
                  .filter((e) => e.state === "candidate")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.characterName})
                    </option>
                  ))}
              </select>
              <input className="form-input" type="text" placeholder="허락이 직접 남기는 한 줄 코멘트" />
            </div>
          ))}
          <button type="submit" className="btn btn-primary is-disabled" disabled>
            결과 발표 <span className="btn-note">(준비중)</span>
          </button>
        </form>
      </section>
    </PageShell>
  );
}
