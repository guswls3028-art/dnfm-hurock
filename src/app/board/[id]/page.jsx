"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import AdminPostMenu from "@/components/AdminPostMenu";
import AuthorCard from "@/components/AuthorCard";
import BoardFab from "@/components/BoardFab";
import ReportButton from "@/components/ReportButton";
import MarkdownBody from "@/components/MarkdownBody";
import {
  ApiError,
  buildApiUrl,
  comments as commentsApi,
  posts as postsApi,
} from "@/lib/api-client";
import { formatAuthor } from "@/lib/anonymous";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const MIN_GUEST_PW = 4;

function formatTime(iso) {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  const diffSec = Math.floor((Date.now() - t.getTime()) / 1000);
  if (diffSec < 60) return "방금";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}일 전`;
  return t.toLocaleDateString("ko-KR");
}

export default function BoardDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useCurrentUser();
  const isAuthed = Boolean(user);
  const userIsAdmin = isAdmin(user, "hurock");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [nextPosts, setNextPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteBusy, setVoteBusy] = useState(false);

  const [commentBody, setCommentBody] = useState("");
  const [commentNickname, setCommentNickname] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyNickname, setReplyNickname] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [pData, cData] = await Promise.all([
          postsApi.detail(id),
          commentsApi.list(id).catch(() => null),
        ]);
        if (!alive) return;
        const p = pData?.post || pData;
        setPost(p);
        const list = cData?.items || cData?.comments || [];
        setComments(list);
        // 같은 카테고리 다음 글 stream — 현재 글 제외 10건.
        const slug = p?.categorySlug;
        if (slug) {
          try {
            const nx = await postsApi.list({
              categorySlug: slug,
              sort: "recent",
              pageSize: 11,
              page: 1,
            });
            const arr = Array.isArray(nx?.items) ? nx.items : [];
            if (alive) setNextPosts(arr.filter((x) => x.id !== p.id).slice(0, 10));
          } catch {
            if (alive) setNextPosts([]);
          }
        } else if (alive) {
          setNextPosts([]);
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof ApiError ? err : { message: err?.message || "글 불러오기 실패" });
        setPost(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, reloadTick]);

  const reloadAll = () => setReloadTick((t) => t + 1);

  async function handleVote(voteType) {
    if (!isAuthed) {
      window.location.href = `/login?returnTo=${encodeURIComponent(`/board/${id}`)}`;
      return;
    }
    setVoteBusy(true);
    setActionMsg(null);
    try {
      await postsApi.vote(id, voteType);
      reloadAll();
    } catch (err) {
      setActionMsg({ ok: false, text: err?.message || "투표 실패" });
    } finally {
      setVoteBusy(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentBody.trim() || commentBusy) return;
    setCommentBusy(true);
    setActionMsg(null);
    try {
      const payload = { body: commentBody.trim() };
      if (!isAuthed) {
        if (commentNickname.trim()) payload.guestNickname = commentNickname.trim();
        if (commentPassword) {
          if (commentPassword.length < MIN_GUEST_PW) {
            setActionMsg({ ok: false, text: `비밀번호는 ${MIN_GUEST_PW}자 이상이에요.` });
            setCommentBusy(false);
            return;
          }
          payload.guestPassword = commentPassword;
        }
      }
      await commentsApi.create(id, payload);
      setCommentBody("");
      setCommentPassword("");
      reloadAll();
    } catch (err) {
      setActionMsg({
        ok: false,
        text: err instanceof ApiError ? err.message : err?.message || "댓글 등록 실패",
      });
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleDeletePost() {
    if (!post) return;
    const isOwnMember = post.authorId && user?.id === post.authorId;
    let guestPassword;
    if (!userIsAdmin && !isOwnMember && !post.authorId) {
      const pw = window.prompt("비회원 글 — 작성 시 비밀번호를 입력하세요.");
      if (!pw) return;
      guestPassword = pw;
    }
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await postsApi.remove(post.id || id, { guestPassword });
      window.location.href = "/board";
    } catch (err) {
      setActionMsg({ ok: false, text: err?.message || "삭제 실패" });
    }
  }

  function startReply(c) {
    setReplyParentId(c.id);
    setReplyBody("");
    setReplyNickname("");
    setReplyPassword("");
  }
  function cancelReply() {
    setReplyParentId(null);
    setReplyBody("");
  }
  async function submitReply() {
    if (!replyParentId || replyBusy) return;
    const body = replyBody.trim();
    if (!body) return;
    setReplyBusy(true);
    try {
      const payload = { body, parentId: replyParentId };
      if (!isAuthed) {
        if (replyNickname.trim()) payload.guestNickname = replyNickname.trim();
        if (replyPassword) {
          if (replyPassword.length < 4) {
            setActionMsg({ ok: false, text: "비밀번호는 4자 이상이어야 해요." });
            setReplyBusy(false);
            return;
          }
          payload.guestPassword = replyPassword;
        }
      }
      await commentsApi.create(post.id || id, payload);
      cancelReply();
      reloadAll();
    } catch (err) {
      setActionMsg({ ok: false, text: err?.message || "답글 등록 실패" });
    } finally {
      setReplyBusy(false);
    }
  }

  function startEditComment(c) {
    setEditingCommentId(c.id);
    setEditingBody(c.body || "");
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingBody("");
  }

  async function saveEditComment(c) {
    const body = editingBody.trim();
    if (!body) return;
    const isOwnMember = c.authorId && user?.id === c.authorId;
    let guestPassword;
    if (!userIsAdmin && !isOwnMember && !c.authorId) {
      const pw = window.prompt("비회원 댓글 — 작성 시 비밀번호를 입력하세요.");
      if (!pw) return;
      guestPassword = pw;
    }
    try {
      await commentsApi.update(c.id, { body, guestPassword });
      cancelEditComment();
      reloadAll();
    } catch (err) {
      setActionMsg({ ok: false, text: err?.message || "댓글 수정 실패" });
    }
  }

  async function handleDeleteComment(c) {
    const isOwnMember = c.authorId && user?.id === c.authorId;
    let guestPassword;
    if (!userIsAdmin && !isOwnMember && !c.authorId) {
      const pw = window.prompt("비회원 댓글 — 작성 시 비밀번호를 입력하세요.");
      if (!pw) return;
      guestPassword = pw;
    }
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await commentsApi.remove(c.id, { guestPassword });
      reloadAll();
    } catch (err) {
      setActionMsg({ ok: false, text: err?.message || "댓글 삭제 실패" });
    }
  }

  const commentsTree = useMemo(() => {
    const tops = [];
    const childMap = new Map();
    for (const c of comments) {
      if (c.parentId) {
        if (!childMap.has(c.parentId)) childMap.set(c.parentId, []);
        childMap.get(c.parentId).push(c);
      } else {
        tops.push(c);
      }
    }
    return tops.map((t) => ({ ...t, replies: childMap.get(t.id) || [] }));
  }, [comments]);

  const canDeletePostAsAuthor = useMemo(() => {
    if (!post) return false;
    if (userIsAdmin) return true;
    if (post.authorId && user?.id === post.authorId) return true;
    if (!post.authorId) return true; // 비회원 글 — 비번 prompt
    return false;
  }, [post, user, userIsAdmin]);

  if (loading) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <div>
            <h1>불러오는 중…</h1>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !post) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <div>
            <h1>게시글</h1>
            <Link href="/board">← 허락방 목록</Link>
          </div>
        </div>
        <div className="callout-box is-pending">
          <strong>불러오기 실패</strong>
          {error?.message || "글을 찾을 수 없어요."}
        </div>
      </PageShell>
    );
  }

  const authorLabel = formatAuthor(post, post.authorDisplayName || post.user?.displayName);
  const categoryName = post.categoryName || post.category || "글";

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
              {categoryName}
            </StickerBadge>{" "}
            {post.flair ? (
              <StickerBadge tone="yellow" rotate="r">
                [{post.flair}]
              </StickerBadge>
            ) : null}{" "}
            {authorLabel} · {formatTime(post.createdAt)} · 조회 {post.viewCount ?? "-"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ReportButton targetType="post" targetId={post.id || id} />
          {canDeletePostAsAuthor ? (
            <Link
              href={`/board/${encodeURIComponent(post.id || id)}/edit`}
              className="btn btn-sm"
            >
              ✏ 수정
            </Link>
          ) : null}
          {canDeletePostAsAuthor ? (
            <button type="button" className="btn btn-sm" onClick={handleDeletePost}>
              🗑 삭제
            </button>
          ) : null}
          {userIsAdmin ? (
            <AdminPostMenu
              postId={post.id || id}
              pinned={Boolean(post.pinned)}
              locked={Boolean(post.locked)}
              onChange={reloadAll}
            />
          ) : null}
        </div>
      </div>

      <article className="form-block" style={{ lineHeight: 1.7 }}>
        <MarkdownBody source={post.body} format={post.bodyFormat} />
        {Array.isArray(post.attachmentR2Keys) && post.attachmentR2Keys.length > 0 ? (
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {post.attachmentR2Keys.map((k, i) => (
              <a
                key={`${k}-${i}`}
                href={buildApiUrl(`/uploads/r2/${encodeURIComponent(k)}`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  border: "2px solid var(--ink, #1a1a1a)",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--paper, #fffef7)",
                }}
              >
                <img
                  src={buildApiUrl(`/uploads/r2/${encodeURIComponent(k)}`)}
                  alt=""
                  loading="lazy"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </a>
            ))}
          </div>
        ) : null}
      </article>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => handleVote("recommend")}
          disabled={voteBusy}
        >
          ▲ 추천 {post.recommendCount ?? post.likes ?? 0}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => handleVote("downvote")}
          disabled={voteBusy}
        >
          ▼ 비추 {post.downvoteCount ?? post.dislikes ?? 0}
        </button>
        {actionMsg ? (
          <span style={{ alignSelf: "center", color: actionMsg.ok ? "var(--primary-ink)" : "var(--hot-pink, #ff3ea5)" }}>
            {actionMsg.text}
          </span>
        ) : null}
      </div>

      {post.author ? (
        <AuthorCard
          author={{
            displayName: post.author.displayName || post.authorDisplayName,
            avatarR2Key: post.author.avatarR2Key,
            dnfProfile: post.author.dnfProfile,
          }}
        />
      ) : null}

      <section className="section" aria-labelledby="comments">
        <div className="section-head">
          <h2 id="comments">댓글 ({comments.length})</h2>
        </div>
        <div className="grid" style={{ gap: 8 }}>
          {commentsTree.length === 0 ? (
            <article className="card" style={{ padding: 14 }}>
              <p>아직 댓글이 없어요. 첫 댓글 남기기 ↓</p>
            </article>
          ) : (
            commentsTree.flatMap((top) => {
              const rows = [renderHurockCommentRow(top, false)];
              for (const reply of top.replies) {
                rows.push(renderHurockCommentRow(reply, true));
              }
              if (replyParentId === top.id) {
                rows.push(
                  <article
                    key={`reply-form-${top.id}`}
                    className="card"
                    style={{
                      flexDirection: "column",
                      gap: 6,
                      padding: 14,
                      marginLeft: 28,
                      borderLeft: "3px solid var(--hot-pink, #ff3ea5)",
                    }}
                  >
                    <strong style={{ fontSize: "0.85rem" }}>
                      ↳ {formatAuthor(top, top.authorDisplayName)} 에게 답글
                    </strong>
                    {!isAuthed ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 6,
                        }}
                      >
                        <input
                          className="form-input"
                          placeholder="닉네임 (선택)"
                          value={replyNickname}
                          maxLength={32}
                          onChange={(e) => setReplyNickname(e.target.value)}
                        />
                        <input
                          className="form-input"
                          type="password"
                          placeholder="비번 (선택, 4자+)"
                          value={replyPassword}
                          maxLength={128}
                          onChange={(e) => setReplyPassword(e.target.value)}
                        />
                      </div>
                    ) : null}
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="답글 작성…"
                    />
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={cancelReply}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-primary"
                        onClick={submitReply}
                        disabled={replyBusy || !replyBody.trim()}
                      >
                        {replyBusy ? "등록 중…" : "답글 등록"}
                      </button>
                    </div>
                  </article>,
                );
              }
              return rows;
            })
          )}
        </div>

        {post.locked ? (
          <div className="callout-box" style={{ marginTop: 14 }}>
            <strong>잠긴 글</strong>
            댓글을 달 수 없어요.
          </div>
        ) : (
          <form className="form-block" onSubmit={handleComment} style={{ marginTop: 14 }}>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.78rem",
                margin: "0 0 8px",
              }}
            >
              정책 위반 댓글은 삭제될 수 있어요.
            </p>
            {!isAuthed ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="닉네임 (선택, 기본 ㅇㅇ)"
                  maxLength={32}
                  value={commentNickname}
                  onChange={(e) => setCommentNickname(e.target.value)}
                />
                <input
                  className="form-input"
                  type="password"
                  placeholder="비밀번호 (선택, 4자+)"
                  maxLength={128}
                  value={commentPassword}
                  onChange={(e) => setCommentPassword(e.target.value)}
                />
              </div>
            ) : null}
            <div className="form-row">
              <label htmlFor="comment-body">댓글 남기기</label>
              <textarea
                id="comment-body"
                className="form-textarea"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={isAuthed ? "짧게 한 줄도 OK" : "비회원도 댓글 가능 — 짧게 한 줄도 OK"}
                style={{ minHeight: 84 }}
                disabled={commentBusy}
              />
            </div>
            {actionMsg && !actionMsg.ok ? (
              <div className="callout-box is-pending">
                <strong>실패</strong>
                {actionMsg.text}
              </div>
            ) : null}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={commentBusy || !commentBody.trim()}
            >
              {commentBusy ? "등록 중…" : "댓글 등록"}
            </button>
          </form>
        )}
      </section>

      {nextPosts.length > 0 ? (
        <section
          className="section"
          aria-labelledby="next-posts"
          style={{ marginTop: 22 }}
        >
          <div className="section-head">
            <h2 id="next-posts">
              <StickerBadge tone="cyan" rotate="l">
                {categoryName}
              </StickerBadge>{" "}
              다음 글 이어보기
            </h2>
            <Link
              href={`/board?category=${encodeURIComponent(post.categorySlug || "")}`}
              className="btn btn-sm"
            >
              {categoryName} 전체 →
            </Link>
          </div>
          <ul
            style={{
              display: "grid",
              gap: 6,
              marginTop: 10,
              listStyle: "none",
              padding: 0,
            }}
          >
            {nextPosts.map((np) => (
              <li key={np.id}>
                <Link
                  href={`/board/${encodeURIComponent(np.id)}`}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "baseline",
                    padding: "10px 12px",
                    border: "2px dashed var(--ink, #1a1a1a)",
                    background: "var(--paper, #fffef7)",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "var(--hot-pink, #ff3ea5)",
                    }}
                  >
                    [{np.categoryName || categoryName}]
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {np.title || "(제목 없음)"}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem", flexShrink: 0 }}>
                    💬 {np.commentCount ?? 0}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem", flexShrink: 0 }}>
                    👁 {np.viewCount ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <BoardFab />
    </PageShell>
  );

  function renderHurockCommentRow(c, isReply) {
    const isOwn = c.authorId && user?.id === c.authorId;
    const canEditDelete = userIsAdmin || isOwn || !c.authorId;
    const isEditing = editingCommentId === c.id;
    return (
      <article
        key={c.id || `${c.authorNickname}-${c.createdAt}`}
        className="card"
        style={{
          flexDirection: "row",
          gap: 14,
          padding: 14,
          ...(isReply
            ? { marginLeft: 28, borderLeft: "3px solid var(--accent-cyan, #06a3d6)" }
            : {}),
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            {isReply ? <span style={{ color: "var(--muted)" }}>↳</span> : null}
            <strong style={{ fontFamily: "var(--font-display)" }}>
              {formatAuthor(c, c.authorDisplayName || c.user?.displayName)}
            </strong>
            <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
              {formatTime(c.createdAt)}
            </span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <ReportButton targetType="comment" targetId={c.id} small />
              {!isReply && !isEditing ? (
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => startReply(c)}
                  title="답글"
                >
                  ↳
                </button>
              ) : null}
              {canEditDelete && !isEditing ? (
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => startEditComment(c)}
                  title="댓글 수정"
                >
                  ✏
                </button>
              ) : null}
              {canEditDelete ? (
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleDeleteComment(c)}
                  title="댓글 삭제"
                >
                  🗑
                </button>
              ) : null}
            </span>
          </div>
          {isEditing ? (
            <div style={{ display: "grid", gap: 6 }}>
              <textarea
                className="form-textarea"
                rows={3}
                value={editingBody}
                onChange={(e) => setEditingBody(e.target.value)}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-xs" onClick={cancelEditComment}>
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-primary"
                  onClick={() => saveEditComment(c)}
                  disabled={!editingBody.trim()}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
          )}
        </div>
      </article>
    );
  }
}
