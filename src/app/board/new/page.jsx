"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { boardCategories } from "@/lib/content";
import { ApiError, posts as postsApi } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";
import { useCurrentUser } from "@/lib/use-current-user";

export default function BoardNewPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [form, setForm] = useState({ category: "잡담", title: "", body: "" });
  const [image, setImage] = useState({ uploading: false, url: null, error: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleFile(file) {
    if (!file) return;
    setImage({ uploading: true, url: null, error: null });
    try {
      const url = await uploadFile(file, { scope: "board-image" });
      setImage({ uploading: false, url, error: null });
    } catch (err) {
      setImage({ uploading: false, url: null, error: err });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.body.trim()) {
      setError({ message: "제목/본문을 입력해 주세요." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await postsApi.create({
        category: form.category,
        title: form.title.trim(),
        body: form.body.trim(),
        imageUrl: image.url || undefined,
      });
      const newId = res?.id || res?.post?.id;
      router.push(newId ? `/board/${newId}` : "/board");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      else setError({ message: err?.message || "글 등록 실패" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/board">
        <div className="page-head">
          <div>
            <h1>로그인 필요</h1>
            <p>글쓰기는 로그인 후 가능합니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">로그인 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/board/new")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>새 글 쓰기</h1>
          <p>욕설·도배·홍보 글은 자동으로 묻힙니다. 짧고 재밌게.</p>
        </div>
      </div>

      <form className="form-block" onSubmit={handleSubmit} aria-label="글쓰기 폼">
        <div className="form-row">
          <label htmlFor="post-cat">카테고리</label>
          <select
            id="post-cat"
            className="form-select"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
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
          <input
            id="post-title"
            className="form-input"
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="한 줄로 요약"
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="post-body">본문</label>
          <textarea
            id="post-body"
            className="form-textarea"
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder="자유롭게. 매너만 지켜주세요."
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="post-image">첨부 이미지 (옵션)</label>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            className="form-input"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {image.uploading && <small>업로드 중…</small>}
          {image.url && <small style={{ color: "var(--primary-ink)" }}>✓ 업로드 완료</small>}
          {image.error && (
            <small style={{ color: "var(--danger)" }}>
              업로드 실패: {image.error.message || "재시도 해주세요"}
            </small>
          )}
        </div>

        {error && (
          <div className="callout-box is-pending">
            <strong>등록 실패</strong>
            {error.message || "다시 시도해 주세요."}
          </div>
        )}

        <div className="form-divider" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "등록 중…" : "글 올리기"}
          </button>
          <Link href="/board" className="btn">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
