"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, posts as postsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";
import ImageUploader from "@/components/ImageUploader";
import PostComposerEditor from "@/components/PostComposerEditor";

/**
 * 글 수정 (hurock).
 * - 회원: 본인 authorId 일치만 검증
 * - 비회원: guestPassword 입력으로 본인 확인
 * - admin: 무조건 OK + pinned/locked 토글
 */

const EDIT_TEMPLATES = [
  {
    label: "방송 후기",
    text: "방송/콘텐츠:\n좋았던 장면:\n같이 보고 싶은 클립/링크:\n한 줄 후기:",
  },
  {
    label: "질문 양식",
    text: "상황:\n궁금한 점:\n해본 것:\n스크린샷/링크:",
  },
];

export default function PostEditPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useCurrentUser();
  const userIsAdmin = isAdmin(user, "hurock");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [flair, setFlair] = useState("");
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);
  const [guestPassword, setGuestPassword] = useState("");
  const [attachmentR2Keys, setAttachmentR2Keys] = useState([]);

  const [categoryFlairs, setCategoryFlairs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.detail(id);
      const p = data?.post || data;
      setPost(p);
      setTitle(p.title || "");
      setBody(p.body || "");
      setFlair(p.flair || "");
      setPinned(Boolean(p.pinned));
      setLocked(Boolean(p.locked));
      setAttachmentR2Keys(Array.isArray(p.attachmentR2Keys) ? p.attachmentR2Keys : []);
      try {
        const cats = await postsApi.categories();
        const items = Array.isArray(cats) ? cats : cats?.items || [];
        const found = items.find((c) => c.slug === p.categorySlug || c.id === p.categoryId);
        setCategoryFlairs(Array.isArray(found?.flairs) ? found.flairs : []);
      } catch {
        setCategoryFlairs([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "글 불러오기 실패");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwnMember = post?.authorId && user?.id === post.authorId;
  const isGuestPost = post && !post.authorId;
  const canEdit = userIsAdmin || isOwnMember || isGuestPost;
  const needsGuestPw = isGuestPost && !userIsAdmin;

  async function handleSave(e) {
    e.preventDefault();
    if (saving || !post) return;
    if (!title.trim() || !body.trim()) {
      setActionMsg({ ok: false, text: "제목·본문을 입력하세요." });
      return;
    }
    if (needsGuestPw && !guestPassword) {
      setActionMsg({ ok: false, text: "비밀번호를 입력하세요." });
      return;
    }
    setSaving(true);
    setActionMsg(null);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        flair: flair || null,
        attachmentR2Keys,
      };
      if (userIsAdmin) {
        payload.pinned = pinned;
        payload.locked = locked;
      }
      if (needsGuestPw) payload.guestPassword = guestPassword;
      await postsApi.update(post.id || id, payload);
      router.push(`/board/${encodeURIComponent(post.id || id)}`);
      router.refresh();
    } catch (err) {
      setActionMsg({
        ok: false,
        text: err instanceof ApiError ? err.message : err?.message || "저장 실패",
      });
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <h1>불러오는 중…</h1>
        </div>
      </PageShell>
    );
  }

  if (error || !post) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <h1>글 수정</h1>
        </div>
        <div className="callout-box is-pending">
          <strong>불러오기 실패</strong>
          {error || "글을 찾을 수 없어요."}
        </div>
        <Link href="/board" className="btn">
          ← 게시판
        </Link>
      </PageShell>
    );
  }

  if (!canEdit) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <h1>수정 권한이 없어요</h1>
        </div>
        <Link href={`/board/${encodeURIComponent(post.id || id)}`} className="btn">
          ← 글로 돌아가기
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>
            글 수정 <StickerBadge tone="yellow" rotate="l">EDIT</StickerBadge>
          </h1>
          <p>{post.title}</p>
        </div>
        <Link href={`/board/${encodeURIComponent(post.id || id)}`} className="btn">
          ← 취소
        </Link>
      </div>

      <form className="form-block" onSubmit={handleSave} aria-label="글 수정 폼">
        {categoryFlairs.length > 0 ? (
          <div className="form-row">
            <label htmlFor="edit-flair">말머리</label>
            <select
              id="edit-flair"
              className="form-select"
              value={flair || ""}
              onChange={(e) => setFlair(e.target.value)}
            >
              <option value="">없음</option>
              {categoryFlairs.map((f) => (
                <option key={f} value={f}>
                  [{f}]
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="form-row">
          <label htmlFor="edit-title">제목</label>
          <input
            id="edit-title"
            type="text"
            className="form-input"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <PostComposerEditor
          id="edit-body"
          label="본문"
          value={body}
          onChange={setBody}
          placeholder="본문을 수정해주세요."
          rows={14}
          templates={EDIT_TEMPLATES}
        />

        {isOwnMember || userIsAdmin ? (
          <div className="form-row">
            <label>첨부 이미지</label>
            <ImageUploader
              value={attachmentR2Keys}
              onChange={setAttachmentR2Keys}
              max={5}
            />
          </div>
        ) : null}

        {needsGuestPw ? (
          <div className="form-row">
            <label htmlFor="guest-pw">비회원 비밀번호</label>
            <input
              id="guest-pw"
              type="password"
              className="form-input"
              placeholder="작성 시 입력한 비밀번호"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
            />
            <small style={{ color: "var(--muted)" }}>본인 확인용 — 일치해야 저장됩니다.</small>
          </div>
        ) : null}

        {userIsAdmin ? (
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "8px 12px",
              border: "1px dashed var(--muted)",
              borderRadius: 8,
              fontSize: "0.9rem",
            }}
          >
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              📌 상단 고정
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
              />
              🔒 잠금 (댓글 차단)
            </label>
            <span style={{ color: "var(--muted)" }}>운영자 전용</span>
          </div>
        ) : null}

        {actionMsg && !actionMsg.ok ? (
          <div className="callout-box is-pending">
            <strong>저장 실패</strong>
            {actionMsg.text}
          </div>
        ) : null}

        <div className="form-divider" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
          <Link href={`/board/${encodeURIComponent(post.id || id)}`} className="btn">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
