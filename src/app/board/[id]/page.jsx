import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { boardPostDetail } from "@/lib/content";

export const metadata = { title: "글 상세" };

export default async function BoardDetailPage({ params }) {
  const { id } = await params;
  const post = boardPostDetail; // mock: id 무관

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <Link
            href="/board"
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800
            }}
          >
            ← 허락방 목록
          </Link>
          <h1>{post.title}</h1>
          <p>
            <StickerBadge tone="cyan" rotate="l">
              {post.category}
            </StickerBadge>{" "}
            {post.author} · {post.date} · 조회 {post.views} · 글 ID: {id}
          </p>
        </div>
      </div>

      <article className="form-block" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
        {post.body}
      </article>

      <section className="section" aria-labelledby="comments">
        <div className="section-head">
          <h2 id="comments">댓글 ({post.comments.length})</h2>
        </div>
        <div className="grid" style={{ gap: 8 }}>
          {post.comments.map((c) => (
            <article
              key={c.id}
              className="card"
              style={{ flexDirection: "row", gap: 14, padding: 14 }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <strong style={{ fontFamily: "var(--font-display)" }}>{c.author}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{c.date}</span>
                </div>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </div>

        <form className="form-block" action="#" method="post" style={{ marginTop: 14 }}>
          <div className="form-row">
            <label htmlFor="comment-body">댓글 남기기</label>
            <textarea id="comment-body" className="form-textarea" placeholder="짧게 한 줄도 OK" style={{ minHeight: 84 }} />
          </div>
          <button type="submit" className="btn btn-primary is-disabled" disabled>
            댓글 등록 <span className="btn-note">(준비중)</span>
          </button>
        </form>
      </section>
    </PageShell>
  );
}
