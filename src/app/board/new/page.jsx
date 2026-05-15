"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, posts as postsApi } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";
import ImageUploader from "@/components/ImageUploader";

// hurock 사이트 카테고리 fallback (backend fetch 실패 시).
// backend seed (api/src/shared/db/seed.ts HUROCK_CATEGORIES) 와 slug 일치 유지.
const HUROCK_CATEGORY_FALLBACK = [
  { slug: "talk", name: "잡담", writeRoleMin: "anonymous", allowAnonymous: true, flairs: ["일반", "방송"] },
  { slug: "cheer", name: "응원", writeRoleMin: "anonymous", allowAnonymous: true, flairs: [] },
  { slug: "contest_qa", name: "콘테스트 Q&A", writeRoleMin: "anonymous", allowAnonymous: true, flairs: ["참가", "투표", "결과"] },
];

const MIN_GUEST_PW = 4;

export default function BoardNewPage() {
  // useSearchParams 는 Suspense boundary 안에서만 prerender 통과 (Next.js 15).
  return (
    <Suspense fallback={null}>
      <BoardNewInner />
    </Suspense>
  );
}

function BoardNewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSlug = searchParams.get("category");
  const { user } = useCurrentUser();
  const isAuthed = Boolean(user);

  const [categories, setCategories] = useState(HUROCK_CATEGORY_FALLBACK);
  const [form, setForm] = useState({
    categorySlug: presetSlug || HUROCK_CATEGORY_FALLBACK[0].slug,
    title: "",
    body: "",
    flair: "",
    guestNickname: "",
    guestPassword: "",
  });
  const [attachmentR2Keys, setAttachmentR2Keys] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await postsApi.categories();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (!alive || items.length === 0) return;
        const writable = items
          .filter((c) => c.writeRoleMin !== "admin")
          .map((c) => ({
            slug: c.slug,
            name: c.name,
            writeRoleMin: c.writeRoleMin,
            allowAnonymous: Boolean(c.allowAnonymous),
            flairs: Array.isArray(c.flairs) ? c.flairs : [],
          }));
        if (writable.length > 0) {
          setCategories(writable);
          const init = presetSlug && writable.find((c) => c.slug === presetSlug);
          setForm((f) => ({ ...f, categorySlug: init ? init.slug : writable[0].slug }));
        }
      } catch {
        /* fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, [presetSlug]);

  const selected = useMemo(
    () => categories.find((c) => c.slug === form.categorySlug) || null,
    [categories, form.categorySlug],
  );
  const guestAllowedHere = Boolean(selected?.allowAnonymous);
  const mustLogin = !isAuthed && !guestAllowedHere;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.body.trim()) {
      setError({ message: "제목·본문을 입력해 주세요." });
      return;
    }
    if (mustLogin) {
      setError({ message: "이 카테고리는 회원 전용이에요." });
      return;
    }
    if (!isAuthed && form.guestPassword && form.guestPassword.length < MIN_GUEST_PW) {
      setError({ message: `비밀번호는 ${MIN_GUEST_PW}자 이상이어야 해요.` });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        categorySlug: form.categorySlug,
        title: form.title.trim(),
        body: form.body.trim(),
        attachmentR2Keys,
      };
      if (form.flair) payload.flair = form.flair;
      if (!isAuthed) {
        if (form.guestNickname.trim()) payload.guestNickname = form.guestNickname.trim();
        if (form.guestPassword) payload.guestPassword = form.guestPassword;
      }
      const res = await postsApi.create(payload);
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

  return (
    <PageShell activePath="/board">
      <div className="page-head">
        <div>
          <h1>
            새 글 쓰기 <StickerBadge tone="pink" rotate="l">자유</StickerBadge>
          </h1>
          <p>
            {isAuthed
              ? "짧고 재밌게. 욕설·도배·외부 거래는 즉시 묻힙니다."
              : "비회원도 글 쓸 수 있어요. 닉네임 비우면 'ㅇㅇ'이 됩니다."}
          </p>
        </div>
        <Link href="/board" className="btn">
          ← 게시판
        </Link>
      </div>

      <form
        className="form-block board-compose board-compose--hurock"
        onSubmit={handleSubmit}
        aria-label="글쓰기 폼"
      >
        <div className="form-row">
          <label htmlFor="post-cat">카테고리</label>
          <select
            id="post-cat"
            className="form-select"
            value={form.categorySlug}
            onChange={(e) => {
              update("categorySlug", e.target.value);
              update("flair", "");
            }}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {!c.allowAnonymous ? " · 회원 전용" : ""}
              </option>
            ))}
          </select>
        </div>

        {selected && selected.flairs && selected.flairs.length > 0 ? (
          <div className="form-row">
            <label htmlFor="post-flair">말머리 (선택)</label>
            <select
              id="post-flair"
              className="form-select"
              value={form.flair}
              onChange={(e) => update("flair", e.target.value)}
            >
              <option value="">없음</option>
              {selected.flairs.map((f) => (
                <option key={f} value={f}>
                  [{f}]
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {mustLogin ? (
          <div className="callout-box">
            <strong>회원 전용 카테고리</strong>
            <Link href={`/login?returnTo=${encodeURIComponent("/board/new")}`}>로그인 →</Link>
          </div>
        ) : null}

        {!isAuthed && !mustLogin ? (
          <>
            <div className="form-row">
              <label htmlFor="guest-nick">닉네임 (선택)</label>
              <input
                id="guest-nick"
                className="form-input"
                placeholder="ㅇㅇ"
                maxLength={32}
                value={form.guestNickname}
                onChange={(e) => update("guestNickname", e.target.value)}
              />
              <small style={{ color: "var(--muted)" }}>비우면 'ㅇㅇ' + IP 앞자리로 표시</small>
            </div>
            <div className="form-row">
              <label htmlFor="guest-pw">비밀번호 (선택)</label>
              <input
                id="guest-pw"
                className="form-input"
                type="password"
                placeholder="4자 이상 — 나중에 본인 수정·삭제용"
                maxLength={128}
                value={form.guestPassword}
                onChange={(e) => update("guestPassword", e.target.value)}
              />
              <small style={{ color: "var(--muted)" }}>비우면 본인 수정·삭제 불가</small>
            </div>
          </>
        ) : null}

        <div className="form-row">
          <label htmlFor="post-title">제목</label>
          <input
            id="post-title"
            className="form-input"
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="한 줄로 요약"
            maxLength={200}
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
          <small style={{ color: "var(--muted)" }}>
            마크다운 지원 — <code>**굵게**</code> <code>*기울임*</code> <code>- 목록</code> <code>[링크](url)</code> <code>`코드`</code>
          </small>
        </div>

        {isAuthed ? (
          <div className="form-row">
            <label>첨부 이미지 (옵션)</label>
            <ImageUploader
              value={attachmentR2Keys}
              onChange={setAttachmentR2Keys}
              max={5}
            />
          </div>
        ) : null}

        {error && (
          <div className="callout-box is-pending">
            <strong>등록 실패</strong>
            {error.message || "다시 시도해 주세요."}
          </div>
        )}

        <div className="form-divider" />
        <div className="board-compose__actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || mustLogin}
          >
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
