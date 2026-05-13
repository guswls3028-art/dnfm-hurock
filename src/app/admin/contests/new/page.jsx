import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";

export const metadata = { title: "콘테스트 생성" };

export default function AdminContestNewPage() {
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
          <h1>새 콘테스트 만들기</h1>
          <p>제목/설명/마감/투표 기간/참가 양식 빌더.</p>
        </div>
        <StickerBadge tone="lime" rotate="r">
          생성 마법사
        </StickerBadge>
      </div>

      <form className="form-block" action="#" method="post">
        <div className="form-step">기본 정보</div>
        <div className="form-row">
          <label htmlFor="ac-title">제목</label>
          <input id="ac-title" className="form-input" type="text" placeholder="허락 아바타 콘테스트 2회" />
        </div>
        <div className="form-row">
          <label htmlFor="ac-sub">부제 (한 줄)</label>
          <input id="ac-sub" className="form-input" type="text" placeholder="이번 주 코디 자랑" />
        </div>
        <div className="form-row">
          <label htmlFor="ac-desc">설명</label>
          <textarea id="ac-desc" className="form-textarea" placeholder="참가 조건 / 심사 기준 / 분위기" />
        </div>
        <div className="form-divider" />

        <div className="form-step">기간</div>
        <div className="grid grid-2">
          <div className="form-row">
            <label htmlFor="ac-close">참가 마감</label>
            <input id="ac-close" className="form-input" type="datetime-local" />
          </div>
          <div className="form-row">
            <label htmlFor="ac-vote">투표 마감</label>
            <input id="ac-vote" className="form-input" type="datetime-local" />
          </div>
        </div>
        <div className="form-divider" />

        <div className="form-step">참가 양식 (form_schema)</div>
        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          기본값은 아바타 콘테스트 5필드 (모험단명/캐릭터명/코디 제목/설명/사진). 필요 시 수정/추가.
        </p>
        <div className="grid" style={{ gap: 8 }}>
          {["모험단명", "캐릭터명", "코디 제목", "코디 설명 (textarea)", "코디 사진 (file)"].map((row, i) => (
            <div
              key={row}
              className="board-row"
              style={{ gridTemplateColumns: "40px minmax(0,1fr) 100px 80px", borderRadius: 8, border: "1px solid var(--paper-line)" }}
            >
              <span style={{ fontWeight: 900, color: "var(--primary-ink)" }}>{i + 1}.</span>
              <span style={{ fontWeight: 800 }}>{row}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>필수</span>
              <button type="button" className="btn btn-sm is-disabled" disabled>
                편집
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-sm btn-ghost is-disabled" disabled>
          + 필드 추가 <span className="btn-note">(빌더 준비중)</span>
        </button>

        <div className="form-divider" />

        <div className="form-step">경품</div>
        <div className="form-row">
          <label htmlFor="ac-rew">경품 목록 (한 줄에 하나)</label>
          <textarea id="ac-rew" className="form-textarea" placeholder={"1등: ?\n2~3등: ?\n참가자 전원: ?"} />
        </div>

        <div className="form-divider" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary is-disabled" disabled>
            생성 <span className="btn-note">(준비중)</span>
          </button>
          <Link href="/admin" className="btn">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
