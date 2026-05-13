"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { boardPostDetail as mockDetail } from "@/lib/content";
import { ApiError, posts as postsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";
import AdminPostMenu from "@/components/AdminPostMenu";

export default function BoardDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useCurrentUser();
  const userIsAdmin = isAdmin(user, "hurock");

  const [post, setPost] = useState(mockDetail);
  const [comments, setComments] = useState(mockDetail.comments || []);
  const [usingMock, setUsingMock] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [voteBusy, setVoteBusy] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await postsApi.detail(id);
        if (!alive) return;
        if (data) {
          const p = data.post || data;
          setPost(p);
          if (Array.isArray(p.comments)) setComments(p.comments);
          setUsingMock(false);
        }
      } catch {
        /* mock 유지 */
      }
      try {
        const cs = await postsApi.comments.list(id);
        if (!alive) return;
        const list = Array.isArray(cs) ? cs : cs?.comments || [];
        if (list.length) setComments(list);
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, reloadTick]);

  const reloadPost = () => setReloadTick((t) => t + 1);

  async function handleVote(voteType) {
    // voteType: "recommend" | "downvote" (backend postVoteTypes enum)
    if (!user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(`/board/${id}`)}`;
      return;
    }
    setVoteBusy(true);
    setError(null);
    try {
      const res = await postsApi.vote(id, voteType);
      const updated = res?.post || res;
      setPost((p) => ({
        ...p,
        likes: updated?.likes ?? updated?.recommendCount ?? p.likes,
        dislikes: updated?.dislikes ?? updated?.downvoteCount ?? p.dislikes,
        myVote: voteType,
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err : { message: err?.message || "투표 실패" });
    } finally {
      setVoteBusy(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    if (!user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(`/board/${id}`)}`;
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await postsApi.comments.create(id, { body: commentBody.trim() });
      const newComment = res?.comment || res || {
        id: `tmp-${Date.now()}`,
        author: user.displayName || user.username,
        date: "방금",
        body: commentBody.trim(),
      };
      setComments((c) => [...c, newComment]);
      setCommentBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err : { message: err?.message || "댓글 등록 실패" });
    } finally {
      setSubmitting(false);
    }
  }

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
              fontWeight: 800,
            }}
          >
            ← 허락방 목록
          </Link>
          <h1>
            {post.pinned ? "📌 " : ""}
            {post.title}
          </h1>
          <p>
            <StickerBadge tone="cyan" rotate="l">
              {post.category}
            </StickerBadge>{" "}
            {post.author || post.displayName || "익명"} · {post.date || ""} · 조회 {post.views ?? "-"} · 글 ID: {id}
          </p>
        </div>
        {userIsAdmin && !usingMock ? (
          <AdminPostMenu
            postId={id}
            pinned={Boolean(post.pinned)}
            onChange={reloadPost}
          />
        ) : null}
      </div>

      {usingMock && (
        <div className="callout-box" style={{ marginBottom: 12 }}>
          <strong>안내</strong>
          백엔드 미가용 — 샘플 글 표시 중. 댓글/추천은 백엔드 연결 후 동작.
        </div>
      )}

      <article className="form-block" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
        {post.body}
        {post.imageUrl && (
          <div style={{ marginTop: 12 }}>
            <img
              src={post.imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                border: "2px solid var(--ink)",
                borderRadius: "var(--radius-md)",
              }}
            />
          </div>
        )}
      </article>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => handleVote("recommend")}
          disabled={voteBusy}
        >
          ▲ 추천 {post.likes != null ? `(${post.likes})` : ""}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => handleVote("downvote")}
          disabled={voteBusy}
        >
          ▼ 비추 {post.dislikes != null ? `(${post.dislikes})` : ""}
        </button>
      </div>

      <section className="section" aria-labelledby="comments">
        <div className="section-head">
          <h2 id="comments">댓글 ({comments.length})</h2>
        </div>
        <div className="grid" style={{ gap: 8 }}>
          {comments.map((c) => (
            <article
              key={c.id || `${c.author}-${c.date}`}
              className="card"
              style={{ flexDirection: "row", gap: 14, padding: 14 }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <strong style={{ fontFamily: "var(--font-display)" }}>
                    {c.author || c.displayName || "익명"}
                  </strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{c.date || ""}</span>
                </div>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </div>

        <form className="form-block" onSubmit={handleComment} style={{ marginTop: 14 }}>
          <div className="form-row">
            <label htmlFor="comment-body">댓글 남기기</label>
            <textarea
              id="comment-body"
              className="form-textarea"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={user ? "짧게 한 줄도 OK" : "로그인 후 댓글을 남길 수 있습니다"}
              style={{ minHeight: 84 }}
            />
          </div>
          {error && (
            <div className="callout-box is-pending">
              <strong>실패</strong>
              {error.message || "다시 시도해 주세요."}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "등록 중…" : "댓글 등록"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}
