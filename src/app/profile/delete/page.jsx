"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, loading, refresh } = useCurrentUser();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?returnTo=${encodeURIComponent("/profile/delete")}`);
    }
  }, [loading, user, router]);

  // 자체 가입자 = username 존재. OAuth-only = username null.
  const isLocal = Boolean(user?.username);
  const requiredConfirm = "탈퇴합니다";

  const canSubmit =
    acknowledged &&
    confirmText === requiredConfirm &&
    (isLocal ? Boolean(password) : true);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await auth.deleteAccount({ password: isLocal ? password : undefined });
      await refresh();
      router.push("/?bye=1");
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err?.message || "탈퇴 실패";
      setError(msg);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/profile/delete">
        <div className="page-head">
          <h1>불러오는 중…</h1>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/profile/delete">
      <div className="page-head">
        <div>
          <h1>회원 탈퇴</h1>
          <p>아래 안내를 확인하고 진행해 주세요.</p>
        </div>
        <StickerBadge tone="pink" rotate="r">탈퇴</StickerBadge>
      </div>

      <article className="form-block" style={{ display: "grid", gap: 12, lineHeight: 1.7 }}>
        <h2 style={{ margin: 0 }}>탈퇴 시 처리 내용</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>아이디·비밀번호·OAuth 연동·세션 정보가 즉시 삭제됩니다.</li>
          <li>닉네임·시청자 정보·던파 모험단 정보는 익명화됩니다.</li>
          <li>
            작성한 글·댓글·콘테스트 출품물은 게시판 맥락 보존을 위해{" "}
            <strong>익명 표시(탈퇴 회원)</strong>로 유지됩니다.
          </li>
          <li>모든 디바이스에서 즉시 로그아웃됩니다.</li>
          <li>탈퇴 후 같은 아이디로 신규 가입은 가능합니다.</li>
        </ul>
      </article>

      <form className="form-block" style={{ marginTop: 16 }} onSubmit={handleSubmit} aria-label="회원 탈퇴 폼" noValidate>
        <div className="form-step">탈퇴 확인</div>

        {isLocal ? (
          <div className="form-row">
            <label htmlFor="del-pw">비밀번호 재입력</label>
            <input
              id="del-pw"
              type="password"
              className="form-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호"
              required
            />
            <small>실수 방지용 — OAuth 가입자는 비밀번호 없이 진행됩니다.</small>
          </div>
        ) : (
          <div className="callout-box">
            <strong>OAuth 가입 계정</strong>
            구글/카카오 연동 가입 → 비밀번호 없이 탈퇴 진행됩니다.
          </div>
        )}

        <div className="form-row">
          <label htmlFor="del-confirm">
            확인 문구 — <strong>&ldquo;{requiredConfirm}&rdquo;</strong> 을 입력하세요
          </label>
          <input
            id="del-confirm"
            type="text"
            className="form-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requiredConfirm}
          />
        </div>

        <div className="form-row">
          <label htmlFor="del-ack" style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}>
            <input
              id="del-ack"
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span>위 처리 내용을 확인했으며, 탈퇴를 진행합니다.</span>
          </label>
        </div>

        {error ? (
          <div className="callout-box is-pending">
            <strong>탈퇴 실패</strong>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            className="btn"
            disabled={!canSubmit || submitting}
            style={{
              background: "var(--pink, #ff4d8d)",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            {submitting ? "탈퇴 처리 중…" : "탈퇴하기"}
          </button>
          <Link href="/profile" className="btn btn-ghost">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
