import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { adminMenu, contests } from "@/lib/content";

export const metadata = { title: "허락 어드민" };

const STATUS_TONE = {
  submission: "pink",
  voting: "cyan",
  ended: "ink",
  announced: "amber"
};

export default function AdminPage() {
  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            허락 어드민 <StickerBadge tone="pink" rotate="r">운영자 전용</StickerBadge>
          </h1>
          <p>콘테스트 생성/심사/투표/발표 — 모두 이 페이지에서. 비개발자 self-service 가 목표.</p>
        </div>
        <Link href="/admin/contests/new" className="btn btn-primary">
          + 콘테스트 만들기
        </Link>
      </div>

      <section className="section" aria-labelledby="admin-menu">
        <div className="section-head">
          <h2 id="admin-menu">관리 메뉴</h2>
        </div>
        <div className="grid grid-2">
          {adminMenu.map((m) => (
            <article key={m.id} className="card card-tone-cyan">
              <h3>{m.label}</h3>
              {m.note && <p>{m.note}</p>}
              <div className="card-actions">
                {m.href ? (
                  <Link href={m.href} className="btn btn-sm btn-primary">
                    들어가기
                  </Link>
                ) : (
                  <button type="button" className="btn btn-sm is-disabled" disabled title={m.reason}>
                    들어가기 <span className="btn-note">({m.reason})</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="admin-contests">
        <div className="section-head">
          <h2 id="admin-contests">콘테스트 목록</h2>
          <Link href="/admin/contests/new">+ 새로 만들기</Link>
        </div>
        <div className="board-list">
          <div className="board-row is-head">
            <span>상태</span>
            <span>제목</span>
            <span>참가</span>
            <span>마감</span>
            <span>관리</span>
          </div>
          {contests.map((c) => (
            <Link href={`/admin/contests/${c.id}`} key={c.id} className="board-row">
              <span>
                <StickerBadge tone={STATUS_TONE[c.status]} rotate="0">
                  {c.statusLabel}
                </StickerBadge>
              </span>
              <span className="board-row-title">{c.title}</span>
              <span className="board-row-meta">{c.entries}명</span>
              <span className="board-row-meta">{c.submissionCloses}</span>
              <span className="board-row-meta">상세 →</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
