"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const DEFAULT_FORM_SCHEMA = [
  { key: "adventureName", label: "모험단명", required: true, prefillFrom: "dnfProfile.adventureName" },
  { key: "characterName", label: "캐릭터명", required: true, prefillFrom: "dnfProfile.characterName" },
  { key: "title", label: "코디 제목", required: true, placeholder: "한 줄로 요약" },
  { key: "description", label: "코디 설명", required: true, type: "textarea", placeholder: "컨셉/포인트 아이템/이야기" },
  { key: "photo", label: "코디 사진 (1장)", required: true, type: "file", accept: "image/*" },
];

export default function AdminContestNewPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    submissionCloses: "",
    voteWindow: "",
    rewards: "",
    posterEmoji: "👗",
    tone: "pink",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError({ message: "제목을 입력해 주세요." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        submissionCloses: form.submissionCloses || null,
        voteWindow: form.voteWindow || null,
        rewards: form.rewards
          ? form.rewards.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        posterEmoji: form.posterEmoji,
        tone: form.tone,
        status: "submission",
        formSchema: DEFAULT_FORM_SCHEMA,
      };
      const res = await contestsApi.create(payload);
      const newId = res?.id || res?.contest?.id;
      router.push(newId ? `/admin/contests/${newId}` : "/admin");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      else setError({ message: err?.message || "콘테스트 생성 실패" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <h1>로그인이 필요합니다</h1>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/admin/contests/new")}`} className="btn btn-primary">
          로그인
        </Link>
      </PageShell>
    );
  }
  if (!userLoading && user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <h1>접근 권한이 없습니다 (403)</h1>
          <p>운영자 권한이 필요합니다.</p>
        </div>
        <Link href="/" className="btn">홈으로</Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <Link
            href="/admin"
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← 어드민
          </Link>
          <h1>새 콘테스트 만들기</h1>
          <p>제목/설명/마감/투표 기간/경품. 참가 양식은 기본 5필드(아바타 콘테스트) 로 자동 세팅됩니다.</p>
        </div>
        <StickerBadge tone="lime" rotate="r">
          생성 마법사
        </StickerBadge>
      </div>

      <form className="form-block" onSubmit={handleSubmit}>
        <div className="form-step">기본 정보</div>
        <div className="form-row">
          <label htmlFor="ac-title">제목 *</label>
          <input
            id="ac-title"
            className="form-input"
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="허락 아바타 콘테스트 2회"
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="ac-sub">부제 (한 줄)</label>
          <input
            id="ac-sub"
            className="form-input"
            type="text"
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="이번 주 코디 자랑"
          />
        </div>
        <div className="form-row">
          <label htmlFor="ac-desc">설명</label>
          <textarea
            id="ac-desc"
            className="form-textarea"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="참가 조건 / 심사 기준 / 분위기"
          />
        </div>
        <div className="form-divider" />

        <div className="form-step">기간</div>
        <div className="grid grid-2">
          <div className="form-row">
            <label htmlFor="ac-close">참가 마감</label>
            <input
              id="ac-close"
              className="form-input"
              type="text"
              value={form.submissionCloses}
              onChange={(e) => update("submissionCloses", e.target.value)}
              placeholder="이번 주 일요일 23:59"
            />
            <small>자유 텍스트. 추후 datetime picker 로 교체 예정.</small>
          </div>
          <div className="form-row">
            <label htmlFor="ac-vote">투표 기간</label>
            <input
              id="ac-vote"
              className="form-input"
              type="text"
              value={form.voteWindow}
              onChange={(e) => update("voteWindow", e.target.value)}
              placeholder="마감 다음 날부터 3일"
            />
          </div>
        </div>
        <div className="form-divider" />

        <div className="form-step">참가 양식 (form_schema)</div>
        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          기본값은 아바타 콘테스트 5필드 (모험단명/캐릭터명/코디 제목/설명/사진). 일단 그대로 생성됩니다 — 필요 시 추후 편집.
        </p>
        <div className="grid" style={{ gap: 8 }}>
          {DEFAULT_FORM_SCHEMA.map((f, i) => (
            <div
              key={f.key}
              className="board-row"
              style={{
                gridTemplateColumns: "40px minmax(0,1fr) 100px",
                borderRadius: 8,
                border: "1px solid var(--paper-line)",
              }}
            >
              <span style={{ fontWeight: 900, color: "var(--primary-ink)" }}>{i + 1}.</span>
              <span style={{ fontWeight: 800 }}>{f.label}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                {f.required ? "필수" : "선택"} · {f.type || "text"}
              </span>
            </div>
          ))}
        </div>

        <div className="form-divider" />

        <div className="form-step">경품 (선택)</div>
        <div className="form-row">
          <label htmlFor="ac-rew">경품 목록 (한 줄에 하나)</label>
          <textarea
            id="ac-rew"
            className="form-textarea"
            value={form.rewards}
            onChange={(e) => update("rewards", e.target.value)}
            placeholder={"1등: ?\n2~3등: ?\n참가자 전원: ?"}
          />
        </div>

        {error && (
          <div className="callout-box is-pending">
            <strong>생성 실패</strong>
            {error.message || "다시 시도해 주세요."}
          </div>
        )}

        <div className="form-divider" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "생성 중…" : "생성"}
          </button>
          <Link href="/admin" className="btn">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
