import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { boardCategories } from "@/lib/content";

export const metadata = { title: "글쓰기" };

export default function BoardNewPage() {
  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>새 글 쓰기</h1>
          <p>욕설·도배·홍보 글은 자동으로 묻힙니다. 짧고 재밌게.</p>
        </div>
        <StickerBadge tone="pink" rotate="r">
          준비중
        </StickerBadge>
      </div>

      <form className="form-block" action="#" method="post" aria-label="글쓰기 폼">
        <div className="form-row">
          <label htmlFor="post-cat">카테고리</label>
          <select id="post-cat" className="form-select" defaultValue="잡담">
            {boardCategories
              .filter((c) => c !== "전체")
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="post-title">제목</label>
          <input id="post-title" className="form-input" type="text" placeholder="한 줄로 요약" />
        </div>
        <div className="form-row">
          <label htmlFor="post-body">본문</label>
          <textarea id="post-body" className="form-textarea" placeholder="자유롭게. 매너만 지켜주세요." />
        </div>
        <div className="form-row">
          <label>첨부 이미지 (옵션)</label>
          <div className="form-file-drop">이미지 드래그 / 클릭 (준비중)</div>
        </div>
        <div className="form-divider" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary is-disabled" disabled title="백엔드 연결 전">
            글 올리기 <span className="btn-note">(준비중)</span>
          </button>
          <Link href="/board" className="btn">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
